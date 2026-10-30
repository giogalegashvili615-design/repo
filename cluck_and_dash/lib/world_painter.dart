import 'dart:math';

import 'package:flutter/material.dart';

import 'game_engine.dart';
import 'models.dart';

class WorldView extends StatelessWidget {
  const WorldView({super.key, required this.engine});
  final GameEngine engine;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(painter: WorldPainter(engine));
  }
}

class WorldPainter extends CustomPainter {
  WorldPainter(this.engine);

  final GameEngine engine;
  late Canvas cv;
  late Size size;

  double get horizon => size.height * 0.36;
  double get bottom => size.height * 0.97;
  double get centerX => size.width / 2;
  double get laneSpacing => size.width * 0.62 / 1.6;
  double get pxPerUnit => size.height * 0.13;
  double get baseScale => size.width / 390;

  double t(double z) => 1 / (1 + z * 0.085);
  double groundY(double z) => horizon + (bottom - horizon) * t(z);
  double roadX(double lane, double z) => centerX + lane * laneSpacing * t(z);

  Paint _fill(Color c, {double opacity = 1}) =>
      Paint()..color = c.withOpacity(opacity);

  Paint _stroke(Color c, double width, {double opacity = 1}) => Paint()
    ..color = c.withOpacity(opacity)
    ..style = PaintingStyle.stroke
    ..strokeWidth = width
    ..strokeCap = StrokeCap.round;

  static const white = Color(0xFFFFFFFF);
  static const wingCol = Color(0xFFF2EEE6);
  static const red = Color(0xFFE0452F);
  static const orange = Color(0xFFF5A623);

  @override
  void paint(Canvas canvas, Size sz) {
    cv = canvas;
    size = sz;
    _sky();
    _scenery();
    _roadSurface();
    _fences();
    _sideDecorations();
    _dashes();
    _drawEggs();
    _drawObstacles();
    _chicken();
    _featherBurst();
  }

  @override
  bool shouldRepaint(covariant WorldPainter oldDelegate) => true;

  // MARK: - Scene

  void _sky() {
    final rect = Rect.fromLTWH(0, 0, size.width, horizon + 40);
    final paint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFFE88A66), Color(0xFFF7AC7C), Color(0xFFFFD9A8)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(rect);
    cv.drawRect(rect, paint);
  }

  void _scenery() {
    // sun
    final sun = Offset(centerX, horizon - 18);
    cv.drawCircle(sun, 95, _fill(const Color(0xFFFFE9B0), opacity: 0.25));
    cv.drawCircle(sun, 46, _fill(const Color(0xFFFFEDBE), opacity: 0.95));

    // mountains
    _mountains(horizon, const Color(0xFFC97F6A), 55, 0.0);
    _mountains(horizon + 8, const Color(0xFFB96B5C), 34, 2.1);

    // ground
    cv.drawRect(
      Rect.fromLTWH(0, horizon, size.width, size.height - horizon),
      _fill(const Color(0xFFA9713F)),
    );

    _barnAndWindmill();
  }

  void _mountains(double baseY, Color color, double amp, double seed) {
    final path = Path()..moveTo(0, baseY);
    const steps = 8;
    for (var i = 0; i <= steps; i++) {
      final x = i / steps * size.width;
      final h = (sin(i * 1.7 + seed)).abs() * amp + amp * 0.3;
      path.lineTo(x, baseY - h);
    }
    path
      ..lineTo(size.width, baseY)
      ..close();
    cv.drawPath(path, _fill(color.withOpacity(0.58)));
  }

  void _barnAndWindmill() {
    final s = baseScale;
    final gy = horizon + 2;

    // barn (right)
    final bx = size.width * 0.70;
    final barn = Path()
      ..moveTo(bx, gy)
      ..lineTo(bx, gy - 62 * s)
      ..lineTo(bx + 45 * s, gy - 92 * s)
      ..lineTo(bx + 90 * s, gy - 62 * s)
      ..lineTo(bx + 90 * s, gy)
      ..close();
    cv.drawPath(barn, _fill(const Color(0xFFC23B2E)));
    cv.drawRect(Rect.fromLTWH(bx + 30 * s, gy - 46 * s, 30 * s, 46 * s),
        _fill(const Color(0xFFF3E9DC)));
    final cross = Path()
      ..moveTo(bx + 30 * s, gy - 46 * s)
      ..lineTo(bx + 60 * s, gy)
      ..moveTo(bx + 60 * s, gy - 46 * s)
      ..lineTo(bx + 30 * s, gy);
    cv.drawPath(cross, _stroke(const Color(0xFFC23B2E), 3 * s));
    cv.drawRect(Rect.fromLTWH(bx + 38 * s, gy - 74 * s, 16 * s, 14 * s),
        _fill(const Color(0xFFF3E9DC)));

    // windmill (far right)
    final wx = size.width * 0.90;
    final tower = Path()
      ..moveTo(wx - 10 * s, gy)
      ..lineTo(wx, gy - 78 * s)
      ..lineTo(wx + 10 * s, gy);
    cv.drawPath(tower, _stroke(const Color(0xFF6E4A2E), 3 * s));
    final hub = Offset(wx, gy - 78 * s);
    for (var i = 0; i < 4; i++) {
      final a = engine.runTime * 0.8 + i * pi / 2;
      cv.drawLine(
          hub, Offset(hub.dx + cos(a) * 24 * s, hub.dy + sin(a) * 24 * s),
          _stroke(const Color(0xFFE8DCC8), 2.5 * s));
    }
    cv.drawCircle(hub, 3 * s, _fill(const Color(0xFF6E4A2E)));

    // trees (left)
    for (final (tx, th) in [(0.05, 90.0), (0.16, 64.0), (0.27, 48.0)]) {
      final x = size.width * tx;
      cv.drawRect(
          Rect.fromLTWH(x - 4 * s, gy - th * 0.45 * s, 8 * s, th * 0.45 * s),
          _fill(const Color(0xFF6E4A2E)));
      cv.drawOval(
          Rect.fromLTWH(x - th * 0.42 * s, gy - th * s, th * 0.84 * s,
              th * 0.75 * s),
          _fill(const Color(0xFF5F9B4A)));
    }
  }

  void _roadSurface() {
    final path = Path()
      ..moveTo(roadX(-1.6, 60), groundY(60));
    var z = 58.0;
    while (z >= 0) {
      path.lineTo(roadX(-1.6, z), groundY(z));
      z -= 2;
    }
    z = 0.0;
    while (z <= 60) {
      path.lineTo(roadX(1.6, z), groundY(z));
      z += 2;
    }
    path.close();
    cv.drawPath(path, _fill(const Color(0xFFC68B59)));
  }

  void _dashes() {
    for (final boundary in [-0.5, 0.5]) {
      var z = -(engine.distance % 6);
      while (z < 60) {
        if (z >= 0) {
          final z2 = min(z + 3, 60.0);
          cv.drawLine(
            Offset(roadX(boundary, z), groundY(z)),
            Offset(roadX(boundary, z2), groundY(z2)),
            _stroke(const Color(0xFFFFF3DC), max(1.0, 6 * t((z + z2) / 2)),
                opacity: 0.85),
          );
        }
        z += 6;
      }
    }
  }

  void _fences() {
    for (final side in [-1.0, 1.0]) {
      Offset? prevTop;
      Offset? prevMid;
      var z = -(engine.distance % 5);
      while (z < 55) {
        if (z > 0.2) {
          final x = roadX(side * 1.85, z);
          final y = groundY(z);
          final h = 44 * t(z);
          final w = max(1.5, 7 * t(z));
          cv.drawRect(Rect.fromLTWH(x - w / 2, y - h, w, h),
              _fill(const Color(0xFF8A5A33)));
          final top = Offset(x, y - h);
          final mid = Offset(x, y - h * 0.55);
          final pt = prevTop, pm = prevMid;
          if (pt != null && pm != null) {
            final rail = Path()
              ..moveTo(pt.dx, pt.dy)
              ..lineTo(top.dx, top.dy)
              ..moveTo(pm.dx, pm.dy)
              ..lineTo(mid.dx, mid.dy);
            cv.drawPath(rail, _stroke(const Color(0xFF9C6B3F), max(1.0, 5 * t(z))));
          }
          prevTop = top;
          prevMid = mid;
        }
        z += 5;
      }
    }
  }

  void _sideDecorations() {
    for (var i = 0; i < 8; i++) {
      var z = i * 9.0 - (engine.distance % 9);
      if (z <= 0) z += 72;
      if (z > 62) continue;
      final side = i % 2 == 0 ? -1.0 : 1.0;
      final x = roadX(side * (2.3 + (i % 3) * 0.35), z);
      final y = groundY(z);
      final s = t(z) * baseScale;
      switch (i % 3) {
        case 0:
          _hayBale(x, y, s * 0.9);
        case 1:
          _crate(x, y, s * 0.8);
        default:
          _sunflower(x, y, s);
      }
    }
  }

  // MARK: - Entities

  void _drawEggs() {
    final sorted = [...engine.eggs]..sort((a, b) => b.z.compareTo(a.z));
    for (final e in sorted) {
      final bob = sin(engine.runTime * 4 + e.z) * 3 * t(e.z);
      final x = roadX(e.lane.toDouble(), e.z);
      final y = groundY(e.z) - e.height * pxPerUnit * t(e.z) - bob;
      final r = 13 * t(e.z) * baseScale;
      final eggPaint = Paint()
        ..shader = RadialGradient(
          colors: const [Color(0xFFFFE27A), Color(0xFFE8A91D)],
        ).createShader(Rect.fromCircle(
            center: Offset(x - r * 0.3, y - r * 0.5), radius: r * 2.2));
      cv.drawOval(Rect.fromLTWH(x - r, y - r * 1.25, r * 2, r * 2.5), eggPaint);
      cv.drawOval(
          Rect.fromLTWH(x - r * 0.45, y - r * 0.85, r * 0.5, r * 0.7),
          _fill(white.withOpacity(0.75)));
    }
  }

  void _drawObstacles() {
    final sorted = [...engine.obstacles]..sort((a, b) => b.z.compareTo(a.z));
    for (final o in sorted) {
      final x = roadX(o.lane.toDouble(), o.z);
      final y = groundY(o.z);
      final s = t(o.z) * baseScale;
      switch (o.kind) {
        case ObstacleKind.crate:
          _crate(x, y, s);
        case ObstacleKind.hayBale:
          _hayBale(x, y, s);
        case ObstacleKind.crateStack:
          _crate(x, y, s);
          _crate(x, y - 56 * s, s * 0.78);
        case ObstacleKind.tractor:
          _tractor(x, y, s);
      }
    }
  }

  // MARK: - Obstacle shapes

  void _crate(double x, double y, double s) {
    final w = 64 * s, h = 56 * s;
    final rect = Rect.fromLTWH(x - w / 2, y - h, w, h);
    cv.drawRRect(
        RRect.fromRectAndRadius(rect, Radius.circular(4 * s)),
        _fill(const Color(0xFFA9743F)));
    final inner = Path()
      ..moveTo(rect.left + 5 * s, rect.top + 5 * s)
      ..lineTo(rect.right - 5 * s, rect.bottom - 5 * s)
      ..moveTo(rect.right - 5 * s, rect.top + 5 * s)
      ..lineTo(rect.left + 5 * s, rect.bottom - 5 * s)
      ..moveTo(rect.left, y - h / 2)
      ..lineTo(rect.right, y - h / 2);
    cv.drawPath(inner, _stroke(const Color(0xFF7C4F26), 4 * s));
    cv.drawRRect(RRect.fromRectAndRadius(rect, Radius.circular(4 * s)),
        _stroke(const Color(0xFF7C4F26), 3 * s));
  }

  void _hayBale(double x, double y, double s) {
    final w = 78 * s, h = 48 * s;
    final rect = Rect.fromLTWH(x - w / 2, y - h, w, h);
    final rrect = RRect.fromRectAndRadius(rect, Radius.circular(12 * s));
    cv.drawRRect(rrect, _fill(const Color(0xFFE8B93E)));
    final bands = Path()
      ..moveTo(x - w * 0.2, rect.top)
      ..lineTo(x - w * 0.2, rect.bottom)
      ..moveTo(x + w * 0.2, rect.top)
      ..lineTo(x + w * 0.2, rect.bottom);
    cv.drawPath(bands, _stroke(const Color(0xFFC08A28), 4 * s));
    cv.drawRRect(rrect, _stroke(const Color(0xFFC08A28), 2.5 * s));
  }

  void _sunflower(double x, double y, double s) {
    cv.drawLine(Offset(x, y), Offset(x, y - 46 * s),
        _stroke(const Color(0xFF4E7D3A), 3 * s));
    final cy = y - 52 * s;
    for (var i = 0; i < 8; i++) {
      final a = i * pi / 4;
      cv.drawCircle(
          Offset(x + cos(a) * 10 * s, cy + sin(a) * 10 * s), 5 * s,
          _fill(const Color(0xFFF2C230)));
    }
    cv.drawCircle(Offset(x, cy), 6 * s, _fill(const Color(0xFF6E4A2E)));
  }

  void _tractor(double x, double y, double s) {
    cv.drawCircle(Offset(x - 16 * s, y - 26 * s), 26 * s,
        _fill(const Color(0xFF333333)));
    cv.drawCircle(Offset(x - 16 * s, y - 26 * s), 14 * s,
        _fill(const Color(0xFF9A9A9A)));
    cv.drawCircle(Offset(x + 30 * s, y - 16 * s), 16 * s,
        _fill(const Color(0xFF333333)));
    cv.drawCircle(Offset(x + 30 * s, y - 16 * s), 7 * s,
        _fill(const Color(0xFF9A9A9A)));
    cv.drawRect(Rect.fromLTWH(x - 44 * s, y - 78 * s, 76 * s, 34 * s),
        _fill(const Color(0xFFD9382C)));
    cv.drawRect(Rect.fromLTWH(x + 18 * s, y - 66 * s, 30 * s, 22 * s),
        _fill(const Color(0xFFC02F24)));
    cv.drawRect(Rect.fromLTWH(x - 16 * s, y - 122 * s, 44 * s, 48 * s),
        _fill(const Color(0xFFB02A20)));
    cv.drawRect(Rect.fromLTWH(x - 11 * s, y - 117 * s, 34 * s, 26 * s),
        _fill(const Color(0xFF2E2E2E)));
    cv.drawRect(Rect.fromLTWH(x - 20 * s, y - 128 * s, 52 * s, 8 * s),
        _fill(const Color(0xFF8C221A)));
    cv.drawLine(Offset(x + 8 * s, y - 122 * s), Offset(x + 8 * s, y - 140 * s),
        _stroke(const Color(0xFF3A3A3A), 4 * s));
    for (final lx in [x + 22 * s, x + 38 * s]) {
      cv.drawCircle(Offset(lx, y - 58 * s), 4 * s,
          _fill(const Color(0xFFFFE38A)));
    }
  }

  // MARK: - Chicken

  void _chicken() {
    final s = baseScale;
    final x = roadX(engine.playerLane, 0);
    final ground = groundY(0);

    final shW = 78 * s * max(0.4, 1 - engine.jumpY * 0.18);
    cv.drawOval(Rect.fromLTWH(x - shW / 2, ground - 4 * s, shW, 14 * s),
        _fill(Colors.black.withOpacity(0.18)));

    final running = engine.screen == GameScreen.playing && !engine.crashed;
    final bob = running
        ? sin(engine.distance * 3.2) * 3 * s
        : sin(engine.runTime * 2.4) * 2.5 * s;
    final y = ground - engine.jumpY * pxPerUnit + bob;
    var tilt = (engine.targetLane - engine.playerLane) * 0.35;
    if (engine.jumpY > 0) tilt -= 0.1;
    tilt = max(-0.4, min(0.4, tilt));

    cv.save();
    cv.translate(x, y);
    cv.rotate(tilt);
    cv.scale(s, s);
    _chickenBody(engine.crashed, running, engine.distance);
    cv.restore();
  }

  void _chickenBody(bool crashed, bool running, double distance) {
    // tail feathers
    for (final (dx, dy, rot) in [
      (-34.0, -58.0, -0.7),
      (-40.0, -48.0, -1.1),
      (-30.0, -66.0, -0.35)
    ]) {
      cv.save();
      cv.translate(dx, dy);
      cv.rotate(rot);
      cv.drawOval(Rect.fromLTWH(-8, -20, 16, 34), _fill(white));
      cv.restore();
    }

    // body + wing
    cv.drawOval(Rect.fromLTWH(-42, -88, 84, 76), _fill(white));
    cv.drawOval(Rect.fromLTWH(2, -76, 34, 46), _fill(wingCol));

    // head
    cv.drawOval(Rect.fromLTWH(-8, -122, 50, 46), _fill(white));

    // comb
    for (final cx in [2.0, 14.0, 26.0]) {
      cv.drawRRect(
          RRect.fromRectAndRadius(
              Rect.fromLTWH(cx, -132, 12, 18), const Radius.circular(6)),
          _fill(red));
    }

    // beak + wattle
    final beak = Path()
      ..moveTo(40, -106)
      ..lineTo(56, -99)
      ..lineTo(40, -92)
      ..close();
    cv.drawPath(beak, _fill(orange));
    cv.drawOval(Rect.fromLTWH(32, -94, 10, 14), _fill(red));

    // eyes
    if (crashed) {
      for (final ex in [6.0, 26.0]) {
        final cross = Path()
          ..moveTo(ex - 4, -112)
          ..lineTo(ex + 4, -104)
          ..moveTo(ex + 4, -112)
          ..lineTo(ex - 4, -104);
        cv.drawPath(cross, _stroke(Colors.black, 2.5));
      }
    } else {
      for (final ex in [8.0, 28.0]) {
        cv.drawCircle(Offset(ex, -107.5), 4.5, _fill(Colors.black));
        cv.drawCircle(Offset(ex + 2, -109), 1.5, _fill(Colors.white));
      }
    }

    // legs
    final jumping = engine.jumpY > 0.05;
    for (final (lx, ph) in [( -12.0, 0.0), (12.0, pi)]) {
      final leg = Path()..moveTo(lx, -14);
      if (jumping) {
        leg.lineTo(lx + 8, -4);
      } else {
        leg.lineTo(lx + sin(ph + distance * 5) * 3.2, 0);
      }
      cv.drawPath(leg, _stroke(orange, 5));
    }
  }

  void _featherBurst() {
    for (final f in engine.feathers) {
      cv.save();
      cv.translate(f.x * size.width, f.y * size.height);
      cv.rotate(f.rot);
      cv.drawOval(Rect.fromLTWH(-8, -4, 16, 8),
          _fill(white.withOpacity(min(1.0, f.life))));
      cv.restore();
    }
  }
}
