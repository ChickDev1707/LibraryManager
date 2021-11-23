
function loadCategoryInfoToEditForm(target){
  let editCategoryForm = document.querySelector('#edit-category-modal form')
  let row = target.parentElement.parentElement 
  // button -> td -> tr
  let categoryId = row.querySelector('.category-id').innerText
  let categoryName = row.querySelector('.category-name').innerText

  editCategoryForm.action= `/librarian/policy/book-category/${categoryId}?_method=PUT`

  let categoryNameInput = document.querySelector('#edit-modal-category-name-input')
  categoryNameInput.value = categoryName
}