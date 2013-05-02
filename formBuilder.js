/*
* Rocky Bevins 2012 (moreoutput@gmail.com) --  v 0.0.1
* Create a web-based form from a defined domino designer form. 
* Outputs a string presentation of the HTML5 form
*
*/
var createFormObject = function(options, fn) {
	var frm, // form name
	fields, // fields represented by a form
	db, // domino database / application
	htmlForm = {}, // Array of input profiles, {type: input type, name: input name, value: [input values]}
	i = 0,

	/* Not robust. Creates two words out of camel cased object properties */
	propertyCase = function(str, fn) {
		var j = 0;
			
		str = str.split('');
		str[0] = str[0].toUpperCase();
			
		for (j; j < str.length; j += 1) {
			if (j != 0) {
				if (str[j] != str[j].toLowerCase()) {
					// Uppercase, new word
					str[j] = ' ' + str[j].toUpperCase();
				} 
			}						
		}
		
		if (typeof fn === 'function') {
			return fn(str.join(''));
		} else {
			return str.join('');
		}
	},

	// Fall back for selection choices if no options are passed the field name is used to lookup a document in a lkKeywords field 
	findSelectionOptions = function(fieldName, fn) {
		var optArr = @Explode(@DbLookup(@DbName(), 'lkKeywords', fieldName, 'Values'), '\n');

		if (typeof fn === 'function') {
			return fn(optArr);
		} else {
			return optArr;
		}
	},

	// boolean -- is a passed in field is in options.filter
	isFiltered = function(fieldName) {
		if (options.filter) {
			if (options.filter.toString().indexOf(fieldName) === -1) {
				return false;
			} else {
				return true;
			}
		}
		
		return false;
	},

	// field object -- is a passed in field is in options.select
	isSelect = function(fieldName) {
		var field,
		j = 0,
		id = 'selectField', // id for the select element
		className = fieldName, // class for the select element
		labelText = propertyCase(fieldName); // The Text in the label
		
		if (options.select !== undefined) {
			for (j; j < options.select.length; j += 1) {
				if (options.select[j].name === fieldName) {
					if (options.select[j].id) {
						id = options.select[j].id;
					}
	
					if (options.select[j].className) {
						className = options.select[j].className;
					}
	
					if (options.select[i].options === 0) {
						options.select[i].options = findSelectionOptions();
					}
	
					field = {
						id: id,
						className: className,
						label: labelText,
						name: fieldName,
						type: 'select',
						options: options.select[i].options
					};
					
					return field;
				}
			}
		}
		
		return false;
	},

	// field object --  is a passed in field is in options.file
	isFile = function(fieldName) {
		var field,
		j = 0,
		id = 'fileField', // id for the select element
		className = fieldName, // class for the select element
		labelText = propertyCase(fieldName); // The Text in the label
		
		if (options.file !== undefined) {
			for (j; j < options.file.length; j += 1) {
				if (options.file[j].name === fieldName) {
					if (options.file[j].id) {
						id = options.select[j].id;
					}
	
					if (options.file[j].className) {
						className = options.file[j].className;
					}
	
					field = {
						id: id,
						className: className,
						label: labelText,
						name: fieldName,
						type: 'file',
						value: ''
					};
					
					
					return field
				}
			}
		}
		
		return false;
	},

	// field object -- is a passed in field is in options.hidden
	isHidden = function(fieldName, fn) {
		var field,
		j = 0,
		id = 'fileField', // id for the select element
		className = fieldName, // class for the select element
		labelText = propertyCase(fieldName), // The Text in the label
		value = ''; // Value for the field
		
		if (options.hidden !== undefined) {
			for (j; j < options.hidden.length; j += 1) {
				if (options.hidden[j].name === fieldName) {
					if (options.hidden[j].id) {
						id = options.hidden[j].id;
					}
	
					if (options.hidden[j].className) {
						className = options.hidden[j].className;
					}
	
	
					if (options.hidden[j].className) {
						value = options.hidden[j].value;
					}
	
					field = {
						id: id,
						className: className,
						label: labelText,
						name: fieldName,
						type: 'hidden',
						value: value
					};
					
					return field;
				}
			}
		}

		return false;
	},
		// field object -- default for fields
	isText = function(fieldName, fn) {
		var labelText = propertyCase(fieldName); // The Text in the label
		
		return {
			id: fieldName,
			label: labelText,
			name: fieldName,
			type: 'text',
			value: ''
		}
	};
	
	if (options.database) {
		db = session.getDatabase(options.server, options.database);
	} else {
		db = database;
	}

	if (db) {
		frm = db.getForm(options.form);
	}
	
	// Getting all the fields within the document
	fields = frm.getFields();

	htmlForm.form = frm;
	htmlForm.fields = [];

	for (i; i < fields.length; i += 1) {		
		if (!isFiltered(fields[i])) {
			// Now we build our string with the information we know about the found field
			if (isSelect(fields[i])) {
				htmlForm.fields.push(isSelect(fields[i]));
			} else if (isFile(fields[i])) {
				htmlForm.fields.push(isFile(fields[i]));
			} else if (isHidden(fields[i])) {
				htmlForm.fields.push(isHidden(fields[i]));
			} else {
				htmlForm.fields.push(isText(fields[i]));
			}
		}
	}	
	
	htmlForm.fields.reverse(); // Reverse so we match the Form
	
	options.htmlForm = htmlForm;
	
	if (typeof fn === 'function') {
		return fn(options);
	} else {
		return options;
	}
},

/* Pass in the htmlForm object created with formBuilder and get an html5 string of the form */
formToString = function(htmlFormObj, fn) {
	var i = 0,
	j = 0, // used to loop through select options
	frmId = 'webform', // id of the form
	frmAction = '', // action of the form
	frmMethod = 'POST', // method of the form
	frmName = 'webform', // name of the form
	frmEle = 'div', // type of element that will wrap all form fields
	fieldEle = 'div', // type of element that will wrap each label and input field
	htmlStr = ''; // String representation of the form object

	if (htmlFormObj.id) {
		frmId = htmlFormObj.id;
	}

	if (htmlFormObj.action) {
		frmAction = htmlFormObj.action;
	}

	if (htmlFormObj.method) {
		frmMethod = htmlFormObj.method;
	}

	if (htmlFormObj.name) {
		frmName = htmlFormObj.name;
	}

	if (htmlFormObj.fieldEle) {
		fieldEle = htmlFormObj.fieldEle;
	}

	if (htmlFormObj.frmEle) {
		frmEle = htmlFormObj.frmEle;
	}

	htmlStr += '<form action="' + frmAction + '" method="' + frmMethod + '" id="' + frmId + '" name="' + frmName + '"><' + frmEle + '>';

	for (i; i < htmlFormObj.htmlForm.fields.length; i += 1) {
		if (htmlFormObj.htmlForm.fields[i].type === 'text') {
			htmlStr += '<' + fieldEle + '>' + '<label>' + htmlFormObj.htmlForm.fields[i].label + '<label>' + '<input type="text" value="" name="'
				 + htmlFormObj.htmlForm.fields[i].name + '" id="' + htmlFormObj.htmlForm.fields[i].id + 
				'" /> </' + fieldEle + '>';
		} else if (htmlFormObj.htmlForm.fields[i].type === 'hidden') {
			htmlStr += '<input type="hidden" value="' + htmlFormObj.htmlForm.fields[i].value + '" name="'
				 + htmlFormObj.htmlForm.fields[i].name + '" id="' + htmlFormObj.htmlForm.fields[i].id + 
				'" />';
		} else if (htmlFormObj.htmlForm.fields[i].type === 'select') {
			htmlStr = '<' + fieldEle + '>' + '<label>' + htmlFormObj.htmlForm.fields[i].label + '<label>' + '<input type="hidden" value="' + htmlFormObj.htmlForm.fields[i].value + '" name="'
				 + htmlFormObj.htmlForm.fields[i].name + '" id="' + htmlFormObj.htmlForm.fields[i].id + '">'; 
	
			for (j; j < htmlFormObj.htmlForm.fields[i].options.length; j += 1) {
				htmlStr += '<option value="' + htmlFormObj.htmlForm.fields[i].options[i].value + '">' + htmlFormObj.htmlForm.fields[i].options[i].name + '</option>';
			}

			htmlStr += '</select></' + fieldEle + '>';
		} else if (htmlFormObj.htmlForm.fields[i].type === 'file') {
			htmlStr += '<' + fieldEle + '>' + '<label>' + htmlFormObj.htmlForm.fields[i].label + '<label>' + '<input type="file" value="" name="'
				 + htmlFormObj.htmlForm.fields[i].name + '" id="' + htmlFormObj.htmlForm.fields[i].id + 
				'" /> </' + fieldEle + '>';
		}
	}

	htmlStr += '<button type="submit">Submit</button></form></' + frmEle + '>';

	if (typeof fn === 'function') {
		return fn(htmlStr);
	} else {
		return htmlStr;
	}
};