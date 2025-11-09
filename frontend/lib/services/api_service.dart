import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  // Измените на ваш IP если тестируете на телефоне
  static const String baseUrl = 'http://localhost:3000/api';
  
  final storage = const FlutterSecureStorage();

  // Получить токен
  Future<String?> getToken() async {
    return await storage.read(key: 'auth_token');
  }

  // Сохранить токен
  Future<void> saveToken(String token) async {
    await storage.write(key: 'auth_token', value: token);
  }

  // Удалить токен
  Future<void> deleteToken() async {
    await storage.delete(key: 'auth_token');
  }

  // Заголовки с авторизацией
  Future<Map<String, String>> getHeaders({bool includeAuth = true}) async {
    final headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      final token = await getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  // Регистрация
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String username,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: await getHeaders(includeAuth: false),
      body: jsonEncode({
        'email': email,
        'password': password,
        'username': username,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await saveToken(data['token']);
      return data;
    } else {
      throw Exception(jsonDecode(response.body)['error'] ?? 'Ошибка регистрации');
    }
  }

  // Авторизация
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: await getHeaders(includeAuth: false),
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await saveToken(data['token']);
      return data;
    } else {
      throw Exception(jsonDecode(response.body)['error'] ?? 'Ошибка авторизации');
    }
  }

  // Выход
  Future<void> logout() async {
    await deleteToken();
  }

  // Проверка токена
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null;
  }

  // Поиск продуктов
  Future<List<dynamic>> searchProducts(String query, {String? category}) async {
    final uri = Uri.parse('$baseUrl/nutrition/products/search').replace(
      queryParameters: {
        'q': query,
        if (category != null) 'category': category,
      },
    );

    final response = await http.get(uri, headers: await getHeaders());

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['products'];
    } else {
      throw Exception('Ошибка поиска продуктов');
    }
  }

  // Получить дневник питания
  Future<Map<String, dynamic>> getNutritionDiary(String date) async {
    final uri = Uri.parse('$baseUrl/nutrition/diary').replace(
      queryParameters: {'date': date},
    );

    final response = await http.get(uri, headers: await getHeaders());

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Ошибка получения дневника');
    }
  }

  // Добавить прием пищи
  Future<Map<String, dynamic>> addMeal({
    required String mealDate,
    required String mealType,
    required List<Map<String, dynamic>> items,
    String? notes,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/nutrition/meals'),
      headers: await getHeaders(),
      body: jsonEncode({
        'meal_date': mealDate,
        'meal_type': mealType,
        'items': items,
        if (notes != null) 'notes': notes,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['error'] ?? 'Ошибка добавления приема пищи');
    }
  }

  // Получить упражнения
  Future<List<dynamic>> getExercises({
    String? muscleGroup,
    String? equipment,
    String? difficulty,
    String? search,
  }) async {
    final queryParams = <String, String>{};
    if (muscleGroup != null) queryParams['muscle_group'] = muscleGroup;
    if (equipment != null) queryParams['equipment'] = equipment;
    if (difficulty != null) queryParams['difficulty'] = difficulty;
    if (search != null) queryParams['search'] = search;

    final uri = Uri.parse('$baseUrl/workouts/exercises').replace(
      queryParameters: queryParams.isEmpty ? null : queryParams,
    );

    final response = await http.get(uri, headers: await getHeaders());

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['exercises'];
    } else {
      throw Exception('Ошибка получения упражнений');
    }
  }

  // Получить историю тренировок
  Future<List<dynamic>> getWorkoutSessions({
    String? startDate,
    String? endDate,
  }) async {
    final queryParams = <String, String>{};
    if (startDate != null) queryParams['start_date'] = startDate;
    if (endDate != null) queryParams['end_date'] = endDate;

    final uri = Uri.parse('$baseUrl/workouts/sessions').replace(
      queryParameters: queryParams.isEmpty ? null : queryParams,
    );

    final response = await http.get(uri, headers: await getHeaders());

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['sessions'];
    } else {
      throw Exception('Ошибка получения тренировок');
    }
  }

  // Создать тренировочную сессию
  Future<Map<String, dynamic>> createWorkoutSession({
    required String sessionDate,
    required List<Map<String, dynamic>> sets,
    String? planId,
    String? startTime,
    String? notes,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/workouts/sessions'),
      headers: await getHeaders(),
      body: jsonEncode({
        'session_date': sessionDate,
        'sets': sets,
        if (planId != null) 'plan_id': planId,
        if (startTime != null) 'start_time': startTime,
        if (notes != null) 'notes': notes,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['error'] ?? 'Ошибка создания тренировки');
    }
  }
}
