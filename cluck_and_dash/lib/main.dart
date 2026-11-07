import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import 'game_engine.dart';
import 'game_over_view.dart';
import 'game_view.dart';
import 'menu_view.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final engine = GameEngine();
  await engine.loadBest();
  runApp(CluckAndDashApp(engine: engine));
}

class CluckAndDashApp extends StatelessWidget {
  const CluckAndDashApp({super.key, required this.engine});
  final GameEngine engine;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cluck & Dash 3D',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
      ),
      home: GameRoot(engine: engine),
    );
  }
}

class GameRoot extends StatefulWidget {
  const GameRoot({super.key, required this.engine});
  final GameEngine engine;

  @override
  State<GameRoot> createState() => _GameRootState();
}

class _GameRootState extends State<GameRoot>
    with SingleTickerProviderStateMixin {
  late final Ticker _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((elapsed) {
      widget.engine.tick(elapsed.inMicroseconds / 1000000.0);
    })..start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.engine,
      builder: (context, _) {
        switch (widget.engine.screen) {
          case GameScreen.menu:
            return MenuView(engine: widget.engine);
          case GameScreen.playing:
          case GameScreen.paused:
            return GameView(engine: widget.engine);
          case GameScreen.gameOver:
            return GameOverView(engine: widget.engine);
        }
      },
    );
  }
}
