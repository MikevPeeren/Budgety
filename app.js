// Budget Controller
var BudgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calculatePercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	}

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	}

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var data = {
		allItems: {
			exp: [],
			inc: [],
		},
		totals: {
			exp: 0,
			inc: 0,
		},
		budget: 0,
		percentage: -1,
	};

	var calculateTotal = function(type) {
		var sum = 0;

		data.allItems[type].forEach(function(current) {
			sum += current.value;
		});

		data.totals[type] = sum;
	}

	return {
		addItem: function(type, description, value) {
			var newItem, ID;

			// Create New ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			// Create new Item based on 'inc' or 'exp' type.
			if (type === 'exp') {
				newItem = new Expense(ID, description, value);
			} else if (type === 'inc') {
				newItem = new Income(ID, description, value);
			}

			// Push it into our data structure
			data.allItems[type].push(newItem);

			// Return the new Element.
			return newItem;
		},

		// Removal of an Item
		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		// Calculating the Budget.
		calculateBudget: function() {
			// 1. Calculate total income and expenses.
			calculateTotal('exp');
			calculateTotal('inc');

			// 2. Calculate the budget: income - expenses.
			data.budget = data.totals.inc - data.totals.exp;

			// 3. Calculate the percentage of income that we spent.
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(current){
				current.calculatePercentage(data.totals.inc);
			})
		},

		getPercentages: function(){
			var allPercentages = data.allItems.exp.map(function(current){
				return current.getPercentage();
			});
			return allPercentages;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalIncome: data.totals.inc,
				totalExpenses: data.totals.exp,
				percentage: data.percentage,
			}
		},
	};

})();

// UI Controller
var UIController = (function() {
	var DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		totalIncomeLabel: '.budget__income--value',
		totalExpenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
	};

	return {
		getDOMStrings: function() {
			return DOMStrings;
		},

		getInput: function() {
			return {
				type: document.querySelector(DOMStrings.inputType).value, // Will Either be Inc or Exp.
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
			}
		},

		// Adding a List Item
		addListItem: function(obj, type) {
			var element, HTML, newHTML;
			// Create HTML string with placeholder text.

			if (type === 'inc') {
				element = DOMStrings.incomeContainer;
				HTML = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMStrings.expenseContainer;
				HTML = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// Replace the placeholder text with some actual data.
			newHTML = HTML.replace('%id%', obj.id)
			newHTML = newHTML.replace('%description%', obj.description)
			newHTML = newHTML.replace('%value%', obj.value)

			// Insert the HTML into the ODM.
			document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
		},

		// Removal of Element by ID
		deleteListItem: function(selectorID) {
			var element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		},

		// Clearing the Fields
		clearFields: function() {
			var fields, fieldsArray;

			fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

			fieldsArray = Array.prototype.slice.call(fields);
			fieldsArray.forEach(function(current, index, array) {
				current.value = '';
			});

			fieldsArray[0].focus();
		},

		// Displaying the correct values.
		displayBudget: function(obj) {
			document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMStrings.totalIncomeLabel).textContent = obj.totalIncome;
			document.querySelector(DOMStrings.totalExpenseLabel).textContent = obj.totalExpenses;

			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
		},

	}
})();

// The Global APP Controller
var Controller = (function(BudgetCtrl, UICtrl) {
	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMStrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (13 === event.keyCode || 13 === event.which) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
	};

	// Updating the Budget
	var updateBudget = function() {
		var budget;

		// 1. Calculate the Budget.
		BudgetController.calculateBudget();
		// 2. Return the Budget.
		budget = BudgetController.getBudget();
		// 3. Display the Budget on the UI.
		UICtrl.displayBudget(budget);
	}

	var updatePercentages = function() {
		var percentages;

		// 1. Calculate Percentages.
		BudgetController.calculatePercentages();

		// 2. Read Percentages from the Budget Controller.
		percentages = BudgetController.getPercentages();

		// 3. Update the UI with the new Percentages.
		console.log(percentages);
	}

	// Adding a Item
	var ctrlAddItem = function() {
		var input, newItem;

		// 1. Get the field input data.
		input = UICtrl.getInput();

		if ("" !== input.description && !isNaN(input.value) && 0 < input.value) {
			// 2. Add the item to the BudgetController.
			newItem = BudgetController.addItem(input.type, input.description, input.value);
			// 3. Add the new item to the UI.
			UIController.addListItem(newItem, input.type);
			// 4. Clear the fields.
			UIController.clearFields();
			// 5. Calculate and Update Budget.
			updateBudget();
			// 6. Calculate and Update Percentages.
			updatePercentages();
		}
	}

	// Deleting a Item
	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {
			// itemID will look like inc-0 or some sort.
			spltID = itemID.split('-');
			type = spltID[0];
			ID = parseFloat(spltID[1]);

			// 1. Delete the item from the data structure.
			BudgetController.deleteItem(type, ID);

			// 2. Delete the item from the UI.
			UICtrl.deleteListItem(itemID);

			// 3. Update and show the new budget.
			updateBudget();

			// 4. Calculate and Update Percentages.
			updatePercentages();
		}
	}

	return {
		init: function() {
			console.log('Application has Started');

			// Resetting everything
			UICtrl.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExpenses: 0,
				percentage: -1,
			});

			setupEventListeners();
		}
	};
})(BudgetController, UIController);

Controller.init();
