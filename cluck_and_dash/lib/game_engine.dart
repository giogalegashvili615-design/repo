import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'models.dart';

export 'models.dart';

class GameEngine extends ChangeNotifier {
  GameScreen screen = GameScreen.menu;
  double distance = 0;
  int eggCount = 0;
  double playerLane = 0; // smoothed position in lane units (-1...1)
  int targetLane = 0;
  double jumpY = 0;
  final List<Obstacle> obstacles = [];
  final List<Egg> eggs = [];
  final List<Feather> feathers = [];
  bool crashed = false;
  bool newBest = false;
  double speed = 12;
  double runTime = 0;
  int bestScore = 0;

  int get score => (distance * 4).toInt() + eggCount * 11;
  bool get isRunning => screen == GameScreen.playing && !crashed;

  final _random = Random();
  double _spawnIn = 12;
  double _jumpVelocity = 0;
  double _crashIn = 0;
  double? _lastTick;
  static const _gravity = 26.0;

  Future<void> loadBest() async {
    final prefs = await SharedPreferences.getInstance();
    bestScore = prefs.getInt('bestScore') ?? 0;
    notifyListeners();
  }

  Future<void> _saveBest() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('bestScore', bestScore);
  }

  void startRun() {
    distance = 0;
    eggCount = 0;
    speed = 12;
    playerLane = 0;
    targetLane = 0;
    jumpY = 0;
    _jumpVelocity = 0;
    obstacles.clear();
    eggs.clear();
    feathers.clear();
    crashed = false;
    newBest = false;
    _crashIn = 0;
    _spawnIn = 12;
    screen = GameScreen.playing;
    notifyListeners();
  }

  void quitToMenu() {
    screen = GameScreen.menu;
    notifyListeners();
  }

  void pause() {
    if (screen == GameScreen.playing) {
      screen = GameScreen.paused;
      notifyListeners();
    }
  }

  void resume() {
    if (screen == GameScreen.paused) {
      screen = GameScreen.playing;
      notifyListeners();
    }
  }

  void moveLeft() {
    if (!isRunning) return;
    targetLane = max(-1, targetLane - 1);
    HapticFeedback.lightImpact();
  }

  void moveRight() {
    if (!isRunning) return;
    targetLane = min(1, targetLane + 1);
    HapticFeedback.lightImpact();
  }

  void jump() {
    if (!isRunning || jumpY > 0) return;
    _jumpVelocity = 9.5;
    HapticFeedback.lightImpact();
  }

  void tick(double nowSeconds) {
    final double dt;
    final last = _lastTick;
    dt = last == null ? 0.016 : min(nowSeconds - last, 0.05);
    _lastTick = nowSeconds;
    if (screen != GameScreen.paused) {
      runTime += dt;
      _updateParticles(dt);
    }

    if (screen == GameScreen.menu) {
      distance += dt * 5; // keep scenery scrolling behind the menu
      notifyListeners();
      return;
    }
    if (screen != GameScreen.playing) {
      // game over: keep the feather burst animating behind the card
      if (feathers.isNotEmpty) notifyListeners();
      return;
    }

    if (crashed) {
      _crashIn -= dt;
      if (_crashIn <= 0) {
        if (score > bestScore) {
          bestScore = score;
          newBest = true;
          _saveBest();
        }
        screen = GameScreen.gameOver;
      }
      notifyListeners();
      return;
    }

    speed = min(30.0, speed + dt * 0.45);
    distance += speed * dt;

    final laneDiff = targetLane - playerLane;
    playerLane += laneDiff * min(1.0, dt * 10);

    if (jumpY > 0 || _jumpVelocity > 0) {
      _jumpVelocity -= _gravity * dt;
      jumpY += _jumpVelocity * dt;
      if (jumpY <= 0) {
        jumpY = 0;
        _jumpVelocity = 0;
      }
    }

    for (final o in obstacles) {
      o.z -= speed * dt;
    }
    obstacles.removeWhere((o) => o.z < -3);
    for (final e in eggs) {
      e.z -= speed * dt;
    }
    eggs.removeWhere((e) => e.z < -2);

    _spawnIn -= speed * dt;
    if (_spawnIn <= 0) _spawnPattern();

    _checkCollisions();
    notifyListeners();
  }

  // MARK: - Spawning

  void _spawnPattern() {
    _spawnIn = 11 + _random.nextDouble() * 6;
    final roll = _random.nextInt(100);
    final lane = _random.nextInt(3) - 1;
    const z = 58.0;

    switch (roll) {
      case < 25:
        _spawnObstacle(ObstacleKind.crate, lane, z);
        _spawnEggLine(_otherLane(lane), z + 6, 4);
      case < 45:
        _spawnObstacle(ObstacleKind.hayBale, lane, z);
        _spawnObstacle(ObstacleKind.hayBale, lane, z + 7);
        _spawnEggLine(lane, z + 2, 3, raised: true);
      case < 65:
        _spawnObstacle(ObstacleKind.tractor, lane, z);
        _spawnEggLine(_otherLane(lane), z + 4, 5);
      case < 85:
        _spawnObstacle(ObstacleKind.crateStack, lane, z);
        _spawnObstacle(ObstacleKind.crate, _otherLane(lane), z + 10);
        final free = [-1, 0, 1].firstWhere((l) => l != lane && l != _otherLane(lane));
        _spawnEggLine(free, z + 2, 4);
      default:
        _spawnEggLine(-1, z, 3);
        _spawnEggLine(1, z, 3);
    }
  }

  int _otherLane(int lane) => lane <= 0 ? lane + 1 : lane - 1;

  void _spawnObstacle(ObstacleKind kind, int lane, double z) {
    obstacles.add(Obstacle(lane: lane, z: z, kind: kind));
  }

  void _spawnEggLine(int lane, double z, int count, {bool raised = false}) {
    for (var i = 0; i < count; i++) {
      eggs.add(Egg(lane: lane, z: z + i * 3, height: raised ? 1.1 : 0));
    }
  }

  // MARK: - Collisions

  void _checkCollisions() {
    for (final e in eggs) {
      if (e.taken) continue;
      if (e.z >= 0.9 || e.z <= -0.3) continue;
      if ((e.lane - playerLane).abs() >= 0.55) continue;
      if ((e.height - jumpY).abs() >= 0.85) continue;
      e.taken = true;
      eggCount++;
      HapticFeedback.lightImpact();
    }
    eggs.removeWhere((e) => e.taken);

    if (crashed) return;
    for (final o in obstacles) {
      if (o.z >= 0.9 || o.z <= -0.45) continue;
      if ((o.lane - playerLane).abs() >= 0.55) continue;
      if (!o.kind.jumpable || jumpY < 0.6) {
        _crash();
        return;
      }
    }
  }

  void _crash() {
    crashed = true;
    _crashIn = 0.9;
    HapticFeedback.heavyImpact();
    for (var i = 0; i < 18; i++) {
      feathers.add(Feather(
        x: 0.5 + (_random.nextDouble() - 0.5) * 0.12,
        y: 0.78 + (_random.nextDouble() - 0.5) * 0.12,
        vx: (_random.nextDouble() - 0.5) * 1.2,
        vy: -0.3 - _random.nextDouble() * 1.2,
        rot: _random.nextDouble() * 2 * pi,
        vr: (_random.nextDouble() - 0.5) * 12,
        life: 0.8 + _random.nextDouble() * 0.6,
      ));
    }
  }

  void _updateParticles(double dt) {
    for (final f in feathers) {
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vy += 1.1 * dt;
      f.rot += f.vr * dt;
      f.life -= dt;
    }
    feathers.removeWhere((f) => f.life <= 0);
  }
}
