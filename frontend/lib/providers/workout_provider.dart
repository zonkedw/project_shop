import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class WorkoutProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  String? _error;
  List<dynamic> _exercises = [];
  List<dynamic> _sessions = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<dynamic> get exercises => _exercises;
  List<dynamic> get sessions => _sessions;

  // Загрузить упражнения
  Future<void> loadExercises({
    String? muscleGroup,
    String? equipment,
    String? difficulty,
    String? search,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _exercises = await _apiService.getExercises(
        muscleGroup: muscleGroup,
        equipment: equipment,
        difficulty: difficulty,
        search: search,
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Загрузить историю тренировок
  Future<void> loadSessions({String? startDate, String? endDate}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _sessions = await _apiService.getWorkoutSessions(
        startDate: startDate,
        endDate: endDate,
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Создать тренировочную сессию
  Future<bool> createSession({
    required String sessionDate,
    required List<Map<String, dynamic>> sets,
    String? planId,
    String? startTime,
    String? notes,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.createWorkoutSession(
        sessionDate: sessionDate,
        sets: sets,
        planId: planId,
        startTime: startTime,
        notes: notes,
      );

      // Перезагрузить историю
      await loadSessions();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Очистить ошибку
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
