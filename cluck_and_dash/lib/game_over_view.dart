import 'package:flutter/material.dart';

import 'game_engine.dart';
import 'world_painter.dart';

class GameOverView extends StatelessWidget {
  const GameOverView({super.key, required this.engine});
  final GameEngine engine;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(child: WorldView(engine: engine)),
        Positioned.fill(child: Container(color: Colors.black26)),
        SafeArea(
          child: Column(
            children: [
              const Spacer(),
              _card(),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ],
    );
  }

  Widget _card() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.96),
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Game Over',
              style: TextStyle(
                  fontSize: 34,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF5A3A22))),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF5EFE4),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                _stat(Icons.emoji_events, const Color(0xFFFFC53D), 'Score',
                    '${engine.score}'),
                _stat(Icons.map, const Color(0xFF9AA0A6), 'Distance',
                    '${engine.distance.toInt()} m'),
                _stat(Icons.egg, const Color(0xFFFFC53D), 'Golden Eggs',
                    '${engine.eggCount}'),
              ],
            ),
          ),
          if (engine.newBest) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFFFE9A8),
                borderRadius: BorderRadius.circular(30),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.workspace_premium,
                      color: Color(0xFFE8A91D), size: 20),
                  SizedBox(width: 8),
                  Text('New best!',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF9A6A10))),
                ],
              ),
            ),
          ],
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: engine.startRun,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFE04A32),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: const StadiumBorder(),
              ),
              icon: const Icon(Icons.refresh),
              label: const Text('Run Again',
                  style:
                      TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: engine.quitToMenu,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFE5DED2),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: const StadiumBorder(),
              ),
              child: const Text('Menu',
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF6B5D4F))),
            ),
          ),
        ],
      ),
    );
  }

  Widget _stat(IconData icon, Color iconColor, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: iconColor, size: 20),
          const SizedBox(width: 12),
          Text(label, style: const TextStyle(color: Color(0xFF6B5D4F))),
          const Spacer(),
          Text(value,
              style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF3E2F23))),
        ],
      ),
    );
  }
}
