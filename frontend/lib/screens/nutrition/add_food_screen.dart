import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/nutrition_provider.dart';

class AddFoodScreen extends StatefulWidget {
  const AddFoodScreen({super.key});

  @override
  State<AddFoodScreen> createState() => _AddFoodScreenState();
}

class _AddFoodScreenState extends State<AddFoodScreen> {
  final _searchController = TextEditingController();
  String _selectedMealType = 'breakfast';
  final List<Map<String, dynamic>> _selectedItems = [];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _search(String query) {
    if (query.length >= 2) {
      final provider = Provider.of<NutritionProvider>(context, listen: false);
      provider.searchProducts(query);
    }
  }

  void _addItem(Map<String, dynamic> product) {
    showDialog(
      context: context,
      builder: (context) => _AddQuantityDialog(
        product: product,
        onAdd: (quantity) {
          setState(() {
            _selectedItems.add({
              'product_id': product['product_id'],
              'name': product['name'],
              'quantity_g': quantity,
              'calories': (product['calories_per_100'] * quantity / 100).round(),
            });
          });
        },
      ),
    );
  }

  Future<void> _saveMeal() async {
    if (_selectedItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Добавьте продукты')),
      );
      return;
    }

    final provider = Provider.of<NutritionProvider>(context, listen: false);
    final now = DateTime.now();
    final dateStr = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

    final items = _selectedItems.map((item) => {
          'product_id': item['product_id'],
          'quantity_g': item['quantity_g'],
        }).toList();

    final success = await provider.addMeal(
      mealDate: dateStr,
      mealType: _selectedMealType,
      items: items,
    );

    if (mounted) {
      if (success) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Прием пищи добавлен')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(provider.error ?? 'Ошибка')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<NutritionProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Добавить еду'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: _saveMeal,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                DropdownButtonFormField<String>(
                  value: _selectedMealType,
                  decoration: const InputDecoration(
                    labelText: 'Прием пищи',
                  ),
                  items: const [
                    DropdownMenuItem(value: 'breakfast', child: Text('Завтрак')),
                    DropdownMenuItem(value: 'lunch', child: Text('Обед')),
                    DropdownMenuItem(value: 'dinner', child: Text('Ужин')),
                    DropdownMenuItem(value: 'snack', child: Text('Перекус')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _selectedMealType = value!;
                    });
                  },
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    labelText: 'Поиск продуктов',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              setState(() {});
                            },
                          )
                        : null,
                  ),
                  onChanged: _search,
                ),
              ],
            ),
          ),
          if (_selectedItems.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: Theme.of(context).colorScheme.primaryContainer,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Выбрано: ${_selectedItems.length}',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  Text(
                    'Всего: ${_selectedItems.fold<int>(0, (sum, item) => sum + (item['calories'] as int))} ккал',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          ],
          Expanded(
            child: provider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : provider.searchResults.isEmpty
                    ? const Center(child: Text('Найдите продукты'))
                    : ListView.builder(
                        itemCount: provider.searchResults.length,
                        itemBuilder: (context, index) {
                          final product = provider.searchResults[index];
                          return ListTile(
                            title: Text(product['name']),
                            subtitle: Text(
                              '${product['calories_per_100']} ккал / 100г',
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.add_circle),
                              color: Theme.of(context).colorScheme.primary,
                              onPressed: () => _addItem(product),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class _AddQuantityDialog extends StatefulWidget {
  final Map<String, dynamic> product;
  final Function(double) onAdd;

  const _AddQuantityDialog({
    required this.product,
    required this.onAdd,
  });

  @override
  State<_AddQuantityDialog> createState() => _AddQuantityDialogState();
}

class _AddQuantityDialogState extends State<_AddQuantityDialog> {
  final _quantityController = TextEditingController(text: '100');

  @override
  void dispose() {
    _quantityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.product['name']),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _quantityController,
            decoration: const InputDecoration(
              labelText: 'Количество (г)',
              suffixText: 'г',
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          Text(
            'Калории: ${((widget.product['calories_per_100'] ?? 0) * (double.tryParse(_quantityController.text) ?? 100) / 100).round()}',
            style: const TextStyle(fontSize: 16),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Отмена'),
        ),
        ElevatedButton(
          onPressed: () {
            final quantity = double.tryParse(_quantityController.text) ?? 0;
            if (quantity > 0) {
              widget.onAdd(quantity);
              Navigator.of(context).pop();
            }
          },
          child: const Text('Добавить'),
        ),
      ],
    );
  }
}
