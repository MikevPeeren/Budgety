// Budget Controller
var BudgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

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
		}
	};

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
		}
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
	};

	return {
		getDOMStrings: function() {
			return DOMStrings;
		},

		getInput: function() {
			return {
				type: document.querySelector(DOMStrings.inputType).value, // Will Either be Inc or Exp.
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: document.querySelector(DOMStrings.inputValue).value,
			}
		},

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

		clearFields: function() {
			var fields, fieldsArray;

			fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

			fieldsArray = Array.prototype.slice.call(fields);
			fieldsArray.forEach(function(current, index, array) {
				current.value = '';
			});

      fieldsArray[0].focus();
		}
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
		})
	};

	var ctrlAddItem = function() {
		var input, newItem;

		// 1. Get the field input data.
		input = UICtrl.getInput();
		// 2. Add the item to the BudgetController.
		newItem = BudgetController.addItem(input.type, input.description, input.value);
		// 3. Add the new item to the UI.
		UIController.addListItem(newItem, input.type);
    // 4. Clear the fields.
    UIController.clearFields();
		// 5. Calculate the Budget
		// 6. Display the budget on the UI
	}

	return {
		init: function() {
			console.log('Application has Started');
			setupEventListeners();
		}
	};
})(BudgetController, UIController);

Controller.init();
