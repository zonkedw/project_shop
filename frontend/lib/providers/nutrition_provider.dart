import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class NutritionProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  String? _error;
  Map<String, dynamic>? _currentDiary;
  List<dynamic> _searchResults = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic>? get currentDiary => _currentDiary;
  List<dynamic> get searchResults => _searchResults;

  // Поиск продуктов
  Future<void> searchProducts(String query, {String? category}) async {
    if (query.length < 2) {
      _searchResults = [];
      notifyListeners();
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _searchResults = await _apiService.searchProducts(query, category: category);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Загрузить дневник за день
  Future<void> loadDiary(String date) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentDiary = await _apiService.getNutritionDiary(date);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Добавить прием пищи
  Future<bool> addMeal({
    required String mealDate,
    required String mealType,
    required List<Map<String, dynamic>> items,
    String? notes,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.addMeal(
        mealDate: mealDate,
        mealType: mealType,
        items: items,
        notes: notes,
      );

      // Перезагрузить дневник
      await loadDiary(mealDate);
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
