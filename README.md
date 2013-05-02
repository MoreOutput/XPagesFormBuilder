XPages Form Builder (0.0.1)
=======

Create HTML forms in your XPage based on a Form in Designer. Aims to help Xpage development when not using the native design rescources (when youre sporting a bare bones setup). Use as a Script Library in Domino Designer. 

Example:

	createFormObject({
		form: 'Client', // Domino Form
		action: '', // Posts to the same xpage
		method: 'POST',
		frmEle: 'ul', // defaults to div
		fieldEle: 'li', // defaults to div
		filter: ['UNID'], // filter out specific fields on the form
		hidden: [{name: 'Category'}],
		file: [{name: 'profileImg'}]
	}, function(frmObj) {
		return formToString(frmObj);
	})

The above code creates:

 	<form action="" method="POST" id="webform" name="webform">
	 	<ul>
	 		<li>
	 			<label>First Name<label>
	 			<input type="text" value="" name="FirstName" id="LastName" />
	 		</li>
	 		<li>
	 			<label>Last Name<label>
	 			<input type="text" value="" name="LastName" id="LastName" />
	 		</li>
	 		<li>
	 			<label>Profile Img<label>
	 			<input type="file" value="" name="profileImg" id="fileField" />
	 		</li>
	 	</ul>
	 	 <input type="hidden" value="" name="Category" id="fileField" />
	 	 <button type="Submit"></button>
	</form>