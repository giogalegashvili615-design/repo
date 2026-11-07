import 'package:flutter/material.dart';

import 'game_engine.dart';
import 'world_painter.dart';

class GameView extends StatelessWidget {
  const GameView({super.key, required this.engine});
  final GameEngine engine;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(child: WorldView(engine: engine)),
        // gesture layer sits below the HUD so the pause button stays tappable
        Positioned.fill(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: engine.jump,
            onHorizontalDragEnd: (d) {
              final v = d.primaryVelocity ?? 0;
              if (v < 0) {
                engine.moveLeft();
              } else if (v > 0) {
                engine.moveRight();
              }
            },
            onVerticalDragEnd: (d) {
              if ((d.primaryVelocity ?? 0) < -100) engine.jump();
            },
          ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Row(
              children: [
                _capsule(
                  icon: Icons.directions_run,
                  label: '${engine.distance.toInt()} m',
                ),
                const Spacer(),
                _capsule(
                  icon: Icons.egg,
                  iconColor: const Color(0xFFFFC53D),
                  label: '${engine.eggCount}',
                ),
                const SizedBox(width: 10),
                _pauseButton(),
              ],
            ),
          ),
        ),
        if (engine.screen == GameScreen.paused)
          _PauseOverlay(engine: engine),
      ],
    );
  }

  Widget _capsule({
    required IconData icon,
    required String label,
    Color iconColor = Colors.white,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.25),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: iconColor, size: 20),
          const SizedBox(width: 8),
          Text(label,
              style: const TextStyle(
                  color: Colors.white, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _pauseButton() {
    return Material(
      color: Colors.white.withOpacity(0.25),
      shape: const CircleBorder(),
      child: IconButton(
        onPressed: engine.pause,
        icon: const Icon(Icons.pause, color: Colors.white),
      ),
    );
  }
}

class _PauseOverlay extends StatelessWidget {
  const _PauseOverlay({required this.engine});
  final GameEngine engine;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black45,
      child: Center(
        child: Container(
          padding: const EdgeInsets.all(32),
          margin: const EdgeInsets.symmetric(horizontal: 48),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.9),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Paused',
                  style: TextStyle(
                      fontSize: 34,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF5A3A22))),
              const SizedBox(height: 16),
              _button('Resume', const Color(0xFF4E9B4A), engine.resume),
              const SizedBox(height: 12),
              _button('Restart', const Color(0xFFE04A32), engine.startRun),
              const SizedBox(height: 12),
              _button('Menu', const Color(0xFF8C8578), engine.quitToMenu),
            ],
          ),
        ),
      ),
    );
  }

  Widget _button(String label, Color color, VoidCallback onPressed) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: color,
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: const StadiumBorder(),
        ),
        child: Text(label,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
