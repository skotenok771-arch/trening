        // Preloader
        window.addEventListener('load', function() {
            const preloader = document.getElementById('preloader');
            setTimeout(function() {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 1500);
        });

        // DOM Elements
        const addWorkoutBtn = document.getElementById('add-workout-btn');
        const addNutritionBtn = document.getElementById('add-nutrition-btn');
        const workoutModal = document.getElementById('workout-modal');
        const nutritionModal = document.getElementById('nutrition-modal');
        const closeModalBtns = document.querySelectorAll('.close-modal');
        const workoutForm = document.getElementById('workout-form');
        const nutritionForm = document.getElementById('nutrition-form');
        const workoutsList = document.getElementById('workouts-list');
        const nutritionList = document.getElementById('nutrition-list');
        const progressFill = document.getElementById('progress-fill');
        const progressPercent = document.getElementById('progress-percent');
        const workoutsCompleted = document.getElementById('workouts-completed');
        const mealsCompleted = document.getElementById('meals-completed');
        const weeklyProgress = document.getElementById('weekly-progress');

        // Data
        let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
        let nutrition = JSON.parse(localStorage.getItem('nutrition')) || [];

        // Initialize
        function init() {
            renderWorkouts();
            renderNutrition();
            updateStats();
            updateProgress();
            
            // Set today's date as default in forms
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('workout-date').value = today;
            document.getElementById('meal-date').value = today;
        }

        // Render Workouts
        function renderWorkouts() {
            if (workouts.length === 0) {
                workoutsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-dumbbell"></i>
                        <p>Нет запланированных тренировок</p>
                    </div>
                `;
                return;
            }

            workoutsList.innerHTML = '';
            workouts.forEach((workout, index) => {
                const workoutElement = document.createElement('div');
                workoutElement.className = `workout-item ${workout.completed ? 'completed' : ''}`;
                workoutElement.innerHTML = `
                    <div class="item-info">
                        <div class="item-title">${workout.name}</div>
                        <div class="item-details">
                            <span class="item-tag">${workout.type}</span>
                            <span>${workout.duration} мин</span>
                            <span>${formatDate(workout.date)}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        ${!workout.completed ? 
                            `<button class="action-btn success complete-workout" data-index="${index}">
                                <i class="fas fa-check"></i>
                            </button>` : 
                            `<button class="action-btn warning undo-workout" data-index="${index}">
                                <i class="fas fa-undo"></i>
                            </button>`
                        }
                        <button class="action-btn danger delete-workout" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                workoutsList.appendChild(workoutElement);
            });

            // Add event listeners
            document.querySelectorAll('.complete-workout').forEach(btn => {
                btn.addEventListener('click', completeWorkout);
            });
            document.querySelectorAll('.undo-workout').forEach(btn => {
                btn.addEventListener('click', undoWorkout);
            });
            document.querySelectorAll('.delete-workout').forEach(btn => {
                btn.addEventListener('click', deleteWorkout);
            });
        }

        // Render Nutrition
        function renderNutrition() {
            if (nutrition.length === 0) {
                nutritionList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-utensils"></i>
                        <p>Нет запланированных приемов пищи</p>
                    </div>
                `;
                return;
            }

            nutritionList.innerHTML = '';
            nutrition.forEach((item, index) => {
                const nutritionElement = document.createElement('div');
                nutritionElement.className = `nutrition-item ${item.completed ? 'completed' : ''}`;
                nutritionElement.innerHTML = `
                    <div class="item-info">
                        <div class="item-title">${item.name}</div>
                        <div class="item-details">
                            <span class="item-tag">${getMealTypeText(item.type)}</span>
                            <span>${item.calories} ккал</span>
                            <span>${formatDate(item.date)}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        ${!item.completed ? 
                            `<button class="action-btn success complete-nutrition" data-index="${index}">
                                <i class="fas fa-check"></i>
                            </button>` : 
                            `<button class="action-btn warning undo-nutrition" data-index="${index}">
                                <i class="fas fa-undo"></i>
                            </button>`
                        }
                        <button class="action-btn danger delete-nutrition" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                nutritionList.appendChild(nutritionElement);
            });

            // Add event listeners
            document.querySelectorAll('.complete-nutrition').forEach(btn => {
                btn.addEventListener('click', completeNutrition);
            });
            document.querySelectorAll('.undo-nutrition').forEach(btn => {
                btn.addEventListener('click', undoNutrition);
            });
            document.querySelectorAll('.delete-nutrition').forEach(btn => {
                btn.addEventListener('click', deleteNutrition);
            });
        }

        // Update Stats
        function updateStats() {
            const completedWorkouts = workouts.filter(w => w.completed).length;
            const completedMeals = nutrition.filter(n => n.completed).length;
            
            workoutsCompleted.textContent = completedWorkouts;
            mealsCompleted.textContent = completedMeals;
            
            // Calculate weekly progress (simplified)
            const totalItems = workouts.length + nutrition.length;
            const completedItems = completedWorkouts + completedMeals;
            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            
            weeklyProgress.textContent = `${progress}%`;
        }

        // Update Progress Bar
        function updateProgress() {
            const completedWorkouts = workouts.filter(w => w.completed).length;
            const completedMeals = nutrition.filter(n => n.completed).length;
            
            const totalItems = workouts.length + nutrition.length;
            const completedItems = completedWorkouts + completedMeals;
            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            
            progressFill.style.width = `${progress}%`;
            progressPercent.textContent = `${progress}%`;
        }

        // Complete Workout
        function completeWorkout(e) {
            const index = e.target.closest('.complete-workout').dataset.index;
            workouts[index].completed = true;
            saveWorkouts();
            renderWorkouts();
            updateStats();
            updateProgress();
        }

        // Undo Workout
        function undoWorkout(e) {
            const index = e.target.closest('.undo-workout').dataset.index;
            workouts[index].completed = false;
            saveWorkouts();
            renderWorkouts();
            updateStats();
            updateProgress();
        }

        // Delete Workout
        function deleteWorkout(e) {
            const index = e.target.closest('.delete-workout').dataset.index;
            workouts.splice(index, 1);
            saveWorkouts();
            renderWorkouts();
            updateStats();
            updateProgress();
        }

        // Complete Nutrition
        function completeNutrition(e) {
            const index = e.target.closest('.complete-nutrition').dataset.index;
            nutrition[index].completed = true;
            saveNutrition();
            renderNutrition();
            updateStats();
            updateProgress();
        }

        // Undo Nutrition
        function undoNutrition(e) {
            const index = e.target.closest('.undo-nutrition').dataset.index;
            nutrition[index].completed = false;
            saveNutrition();
            renderNutrition();
            updateStats();
            updateProgress();
        }

        // Delete Nutrition
        function deleteNutrition(e) {
            const index = e.target.closest('.delete-nutrition').dataset.index;
            nutrition.splice(index, 1);
            saveNutrition();
            renderNutrition();
            updateStats();
            updateProgress();
        }

        // Save Workouts to LocalStorage
        function saveWorkouts() {
            localStorage.setItem('workouts', JSON.stringify(workouts));
        }

        // Save Nutrition to LocalStorage
        function saveNutrition() {
            localStorage.setItem('nutrition', JSON.stringify(nutrition));
        }

        // Format Date
        function formatDate(dateString) {
            const options = { day: 'numeric', month: 'short' };
            return new Date(dateString).toLocaleDateString('ru-RU', options);
        }

        // Get Meal Type Text
        function getMealTypeText(type) {
            const types = {
                'breakfast': 'Завтрак',
                'lunch': 'Обед',
                'dinner': 'Ужин',
                'snack': 'Перекус'
            };
            return types[type] || type;
        }

        // Event Listeners
        addWorkoutBtn.addEventListener('click', () => {
            workoutModal.style.display = 'flex';
        });

        addNutritionBtn.addEventListener('click', () => {
            nutritionModal.style.display = 'flex';
        });

        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                workoutModal.style.display = 'none';
                nutritionModal.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === workoutModal) {
                workoutModal.style.display = 'none';
            }
            if (e.target === nutritionModal) {
                nutritionModal.style.display = 'none';
            }
        });

        workoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newWorkout = {
                name: document.getElementById('workout-name').value,
                type: document.getElementById('workout-type').value,
                duration: document.getElementById('workout-duration').value,
                date: document.getElementById('workout-date').value,
                notes: document.getElementById('workout-notes').value,
                completed: false
            };
            
            workouts.push(newWorkout);
            saveWorkouts();
            renderWorkouts();
            updateStats();
            updateProgress();
            
            workoutModal.style.display = 'none';
            workoutForm.reset();
            
            // Reset date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('workout-date').value = today;
        });

        nutritionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newNutrition = {
                name: document.getElementById('meal-name').value,
                type: document.getElementById('meal-type').value,
                calories: document.getElementById('meal-calories').value,
                date: document.getElementById('meal-date').value,
                notes: document.getElementById('meal-notes').value,
                completed: false
            };
            
            nutrition.push(newNutrition);
            saveNutrition();
            renderNutrition();
            updateStats();
            updateProgress();
            
            nutritionModal.style.display = 'none';
            nutritionForm.reset();
            
            // Reset date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('meal-date').value = today;
        });

        // Initialize the app
        init();