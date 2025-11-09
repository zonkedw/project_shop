import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/nutrition_provider.dart';

class FoodDiaryScreen extends StatefulWidget {
  const FoodDiaryScreen({super.key});

  @override
  State<FoodDiaryScreen> createState() => _FoodDiaryScreenState();
}

class _FoodDiaryScreenState extends State<FoodDiaryScreen> {
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _loadDiary();
  }

  Future<void> _loadDiary() async {
    final provider = Provider.of<NutritionProvider>(context, listen: false);
    final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
    await provider.loadDiary(dateStr);
  }

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
      _loadDiary();
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<NutritionProvider>(context);
    final diary = provider.currentDiary;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Дневник питания'),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today),
            onPressed: _selectDate,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDiary,
        child: provider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : diary == null
                ? const Center(child: Text('Загрузка...'))
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossStartAlignment.start,
                      children: [
                        Text(
                          DateFormat('dd MMMM yyyy', 'ru').format(_selectedDate),
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        const SizedBox(height: 16),
                        _buildNutrientsSummary(diary),
                        const SizedBox(height: 24),
                        ...(_buildMealsList(diary['meals'] ?? [])),
                      ],
                    ),
                  ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Навигация к экрану добавления еды
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildNutrientsSummary(Map<String, dynamic> diary) {
    final totals = diary['totals'] ?? {};
    final targets = diary['targets'] ?? {};
    final remaining = diary['remaining'] ?? {};

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildNutrientRow(
              'Калории',
              totals['calories'] ?? 0,
              targets['calories'] ?? 0,
              'ккал',
              Colors.orange,
            ),
            const Divider(),
            _buildNutrientRow(
              'Белки',
              totals['protein'] ?? 0,
              targets['protein'] ?? 0,
              'г',
              Colors.red,
            ),
            const Divider(),
            _buildNutrientRow(
              'Углеводы',
              totals['carbs'] ?? 0,
              targets['carbs'] ?? 0,
              'г',
              Colors.blue,
            ),
            const Divider(),
            _buildNutrientRow(
              'Жиры',
              totals['fats'] ?? 0,
              targets['fats'] ?? 0,
              'г',
              Colors.yellow,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNutrientRow(
    String label,
    num current,
    num target,
    String unit,
    Color color,
  ) {
    final percentage = target > 0 ? (current / target).clamp(0.0, 1.0) : 0.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
            Text(
              '$current / $target $unit',
              style: const TextStyle(color: Colors.grey),
            ),
          ],
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: percentage.toDouble(),
          backgroundColor: color.withOpacity(0.2),
          valueColor: AlwaysStoppedAnimation<Color>(color),
        ),
      ],
    );
  }

  List<Widget> _buildMealsList(List<dynamic> meals) {
    if (meals.isEmpty) {
      return [
        const Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: Text('Нет записей о питании'),
          ),
        ),
      ];
    }

    return meals.map((meal) {
      return Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: ExpansionTile(
          title: Text(_getMealTypeName(meal['meal_type'])),
          subtitle: Text(
            '${meal['total_calories']?.round() ?? 0} ккал',
          ),
          children: [
            ...(meal['items'] as List).map((item) {
              return ListTile(
                dense: true,
                title: Text(item['product_name'] ?? item['recipe_name'] ?? ''),
                subtitle: Text(
                  '${item['quantity_g']?.round() ?? item['quantity_ml']?.round() ?? 0}г',
                ),
                trailing: Text(
                  '${item['calories']?.round() ?? 0} ккал',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              );
            }),
          ],
        ),
      );
    }).toList();
  }

  String _getMealTypeName(String type) {
    switch (type) {
      case 'breakfast':
        return 'Завтрак';
      case 'lunch':
        return 'Обед';
      case 'dinner':
        return 'Ужин';
      case 'snack':
        return 'Перекус';
      default:
        return type;
    }
  }
}
