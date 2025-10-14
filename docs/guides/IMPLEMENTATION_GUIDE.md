# Implementation Guide - New Features

## 🚀 Quick Integration Steps

### 1. Import New Components in App.tsx

```tsx
import { MealSearchFilter } from './components/MealSearchFilter';
import { TaskFromMealButton, TaskGenerationInfo } from './components/TaskFromMealButton';
import { PWAInstallPrompt, PWAInstallStatus } from './components/PWAInstallPrompt';
```

### 2. Add State for Search/Filter

In `App.tsx`, add these states:

```tsx
const [mealSearchQuery, setMealSearchQuery] = useState('');
const [mealFilterType, setMealFilterType] = useState<string>('all');
const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
```

### 3. Add Filtering Logic

```tsx
// Filter meals based on search and filters
const filteredMeals = meals.filter(meal => {
  // Search filter
  if (mealSearchQuery && !meal.name.toLowerCase().includes(mealSearchQuery.toLowerCase())) {
    return false;
  }
  
  // Meal type filter
  if (mealFilterType !== 'all' && meal.mealType !== mealFilterType) {
    return false;
  }
  
  // Favorites filter
  if (showFavoritesOnly && !meal.is_favorite && !meal.is_template) {
    return false;
  }
  
  return true;
});
```

### 4. Add Task Generation Handler

```tsx
const handleCreateTaskFromMeal = async (meal: Meal) => {
  try {
    // Calculate prep time (1 hour before meal)
    const mealDateTime = new Date(`${meal.date}T12:00`); // Default noon if no time
    const prepDateTime = new Date(mealDateTime.getTime() - 60 * 60 * 1000);
    
    const newTask = await tasksAPI.create({
      title: `Prep: ${meal.name}`,
      assigned_to: userName,
      due_date: prepDateTime.toISOString().split('T')[0],
      priority: 'medium'
    });
    
    setTasks([...tasks, {
      id: newTask.id,
      title: newTask.title,
      assignedTo: newTask.assigned_to,
      dueDate: newTask.due_date,
      priority: newTask.priority,
      completed: false
    }]);
    
    showToast(`Task created: ${newTask.title}`, 'success');
    
    // Create notification
    createNotification(
      'Task Created from Meal',
      `Prep task for "${meal.name}" has been added`,
      'success',
      'task',
      newTask.id
    );
  } catch (error) {
    console.error('Error creating task from meal:', error);
    showToast('Failed to create task', 'error');
  }
};
```

### 5. Add Shopping List Integration

```tsx
const handleAddMealToShopping = async (mealId: string) => {
  try {
    const result = await mealsAPI.addToShopping(mealId, userName);
    
    showToast(`Added ${result.items?.length || 0} ingredients to shopping list!`, 'success');
    
    // Reload shopping items
    const shoppingData = await shoppingItemsAPI.getAll();
    setShoppingItems(shoppingData.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      notes: item.notes,
      purchased: item.purchased,
      addedBy: item.added_by
    })));
    
    // Create notification
    createNotification(
      'Ingredients Added',
      `${result.items?.length || 0} items from meal added to shopping list`,
      'success',
      'shopping',
      mealId
    );
  } catch (error) {
    console.error('Error adding meal to shopping:', error);
    showToast('Failed to add ingredients', 'error');
  }
};
```

### 6. Update renderMeals() Function

Add the search/filter component and buttons to meal cards:

```tsx
const renderMeals = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center">
      <h3 className="text-2xl font-bold text-gray-900">Meal Planner</h3>
      <button
        onClick={() => {
          setEditingMeal(null);
          setShowMealModal(true);
        }}
        className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
      >
        <Plus className="w-5 h-5" />
        <span>Add Meal</span>
      </button>
    </div>

    {/* Add Search/Filter Component */}
    <MealSearchFilter
      onSearch={setMealSearchQuery}
      onFilterType={setMealFilterType}
      onFilterFavorites={setShowFavoritesOnly}
    />
    
    {/* Optional: Info banner */}
    <TaskGenerationInfo />

    {/* Use filteredMeals instead of meals */}
    {filteredMeals.length === 0 ? (
      <div className="bg-white rounded-2xl p-12 shadow-medium border border-gray-100 text-center">
        <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          {mealSearchQuery || mealFilterType !== 'all' || showFavoritesOnly
            ? 'No meals match your filters'
            : 'No meals planned yet'}
        </h4>
        <p className="text-gray-500 text-sm">
          {mealSearchQuery || mealFilterType !== 'all' || showFavoritesOnly
            ? 'Try adjusting your search or filters'
            : 'Start planning your family meals'}
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {/* Group meals by date logic here */}
        {Object.entries(groupedMeals).map(([date, dayMeals]) => (
          <div key={date} className="bg-white rounded-2xl p-5 shadow-medium border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4">{formatDate(date)}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(dayMeals).map(([type, meals]) => (
                meals.length > 0 && (
                  <div key={type} className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-600 capitalize">{type}</h5>
                    {meals.map(meal => (
                      <div key={meal.id} className="bg-gray-50 rounded-xl p-3 relative group">
                        {/* Meal content */}
                        <p className="font-medium text-gray-900 mb-2">{meal.name}</p>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-1 mt-2">
                          {/* Task generation button */}
                          <TaskFromMealButton
                            meal={meal}
                            onCreateTask={handleCreateTaskFromMeal}
                            compact={true}
                          />
                          
                          {/* Shopping cart button */}
                          <button
                            onClick={() => handleAddMealToShopping(meal.id)}
                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all btn-press"
                            title="Add ingredients to shopping list"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          
                          {/* Existing edit/delete buttons */}
                          <button onClick={() => { setEditingMeal(meal); setShowMealModal(true); }}>
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteMeal(meal.id)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
```

### 7. Add PWA Components to Main App

In your main App component's return statement, add:

```tsx
return (
  <div className="min-h-screen bg-gray-50 flex">
    {/* Existing app content */}
    
    {/* PWA Components */}
    <PWAInstallPrompt />
    <PWAInstallStatus />
    
    {/* Rest of your app */}
  </div>
);
```

## 📱 Testing the Features

### Test Search & Filter
1. Add several meals with different types
2. Use search bar to find meals by name
3. Filter by meal type (breakfast, lunch, etc.)
4. Toggle favorites filter
5. Verify filtered results update correctly

### Test Task Generation
1. Click the checkbox icon on a meal card
2. Navigate to Tasks tab
3. Verify a new "Prep: [Meal Name]" task appears
4. Check that task is assigned to current user
5. Verify notification was created

### Test Shopping Integration
1. Create a meal with ingredients (if your meal form supports it)
2. Click shopping cart icon on meal card
3. Navigate to Shopping tab
4. Verify ingredients were added to the list
5. Check notification was created

### Test PWA
1. Build production: `npm run build`
2. Serve: `npm run preview`
3. Open in browser (Chrome/Edge recommended)
4. Look for install prompt or icon in address bar
5. Click install and test:
   - App opens in standalone window
   - Works offline (after initial load)
   - Shortcuts work
   - Icons display correctly

## 🎨 Styling Notes

All components use your existing Tailwind classes and design system:
- Button styles: `btn-press`, `shadow-soft`, `shadow-medium`
- Colors: Blue primary, gray neutrals
- Spacing: Consistent with your app
- Animations: `animate-fade-in`, `animate-slide-up`

## 🐛 Troubleshooting

### Search Not Working
- Check that `filteredMeals` is used instead of `meals` in render
- Verify state updates are triggering re-renders
- Check console for errors

### Task Generation Fails
- Ensure `tasksAPI.create()` is working
- Check date formatting
- Verify user is logged in / userName is set

### Shopping Integration Fails
- Start Docker: `docker-compose up -d`
- Check backend is running on port 3001
- Verify meal has ingredients in database
- Check API endpoint: `curl http://localhost:3001/api/meals/[id]/add-to-shopping`

### PWA Not Installing
- Must be served over HTTPS (or localhost)
- Check browser console for service worker errors
- Verify `manifest.json` and `sw.js` are accessible
- Try in Chrome/Edge (best PWA support)

## 📈 Performance Tips

### Memoize Filtered Meals
```tsx
const filteredMeals = useMemo(() => {
  return meals.filter(meal => {
    // filter logic
  });
}, [meals, mealSearchQuery, mealFilterType, showFavoritesOnly]);
```

### Debounce Search
```tsx
const [searchInput, setSearchInput] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setMealSearchQuery(searchInput);
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchInput]);
```

## 🎯 Next Steps

After integrating these features:

1. **Test thoroughly** - Try all combinations of filters
2. **Get user feedback** - See which features are most used
3. **Monitor performance** - Check if filtering is fast enough
4. **Add analytics** - Track feature usage

Then consider implementing:
- Drag-and-drop meal planning
- Calendar view for meals
- Export/print meal plans
- Recurring meals

---

**Ready to integrate!** All components are standalone and can be added incrementally. Start with search/filter, then add task generation, then PWA features.

