// variable
const BASE_URL = 'https://user-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/users/'
const USERS_PER_PAGE = 18
const users = []
let filteredUsers = []
let currentPage = 1
const userDataPanel = document.querySelector('#user-data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const buttonOfArrangement = document.querySelector('#button-of-arrangement')

// function
function hasUploadedAvatar(avatar) {
    const fakeAvatar = 'https://fakeimg.pl/900x900/F8F9FA/?text=No upload'
    return avatar ? avatar : fakeAvatar
}

function renderUserList(data) {
    let rawHTML = ''
    if (userDataPanel.dataset.mode === 'small-card') {
        data.forEach(user => {
            rawHTML += `
                        <div class="col-12 col-sm-2 mt-3">
                            <div class="card text-dark bg-light h-100 text-center position-relative">
                                <img src="${hasUploadedAvatar(user.avatar)}" class="card-img-top" alt="user-avatar" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">
                                <div class="card-body d-flex align-items-center justify-content-center">
                                    <h5 class="card-title mb-0 fs-6">${user.name} ${user.surname}</h5>
                                </div>
                                <button type="button" class="btn btn-link position-absolute top-0 end-0 text-muted" id="heart-btn">
                                    <i class="btn-add-favorite fa-solid fa-heart-circle-plus" data-add-favorite-id="${user.id}"></i>
                                </button>
                            </div>
                        </div>
                    `
        })
    } else if (userDataPanel.dataset.mode === 'big-card') {
        data.forEach(user => {
            rawHTML += `
                <div class="col-12 col-sm-6 mt-3">
                    <div class="card text-dark bg-light h-100 position-relative">
                        <div class="row g-0">
                            <div class="col-sm-4 avatar">
                                <img src="${hasUploadedAvatar(user.avatar)}" class="img-fluid rounded-start" alt="user-avatar" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">
                            </div>
                            <div class="col-sm-8">
                                <div class="card-body d-flex flex-column justify-content-center h-100">
                                    <p class="card-text fs-6">
                                        <i class="fa-solid fa-user-tag"></i>&nbsp;${user.name} ${user.surname}
                                    </p>
                                    <p class="card-text fs-6">
                                        <i class="fa-solid fa-person-half-dress fs-5"></i>&nbsp;&nbsp;${user.gender}
                                    </p>
                                    <p class="card-text fs-6">
                                        <i class="fa-solid fa-location-dot"></i>&nbsp;&nbsp;${user.region}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-link text-muted position-absolute bottom-0 end-0" id="heart-btn">
                            <i class="btn-add-favorite fa-solid fa-heart-circle-plus" data-add-favorite-id="${user.id}"></i>
                        </button>
                    </div>
                </div>
            `
        })
    }
    userDataPanel.innerHTML = rawHTML
}

function showUserInfo(id) {
    const modalName = document.querySelector('#user-modal-name')
    const modalAvatar = document.querySelector('#user-modal-avatar')
    const modalOthers = document.querySelector('#user-modal-others')
    modalName.textContent = ''
    modalAvatar.innerHTML = ''
    modalOthers.innerHTML = ''
    axios.get(INDEX_URL + id)
        .then((response) => {
            const user = response.data
            modalName.textContent = user.name + ' ' + user.surname
            modalAvatar.innerHTML = `
                            <img src="${hasUploadedAvatar(user.avatar)}" alt="user-avatar" class="img-fluid">
                        `
            modalOthers.innerHTML = `
                            <li class="list-group-item">email：${user.email}</li>
                            <li class="list-group-item">gender：${user.gender}</li>
                            <li class="list-group-item">age：${user.age}</li>
                            <li class="list-group-item">region：${user.region}</li>
                            <li class="list-group-item">birthday：${user.birthday}</li>
                        `
        })
        .catch((error) => console.log(error))
}

function addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
    const user = users.find(user => user.id === id)
    if (list.some(user => user.id === id)) {
        return alert('This user has already been added to favorite list.')
    }
    list.push(user)
    localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

function renderPaginator(dataQuantity) {
    const numberOfPages = Math.ceil(dataQuantity / USERS_PER_PAGE)
    let rawHTML = ''
    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `
            <li class="page-item mb-5">
                <a class="page-link number-of-page" href="#" data-page="${page}">${page}</a>
            </li>
        `
    }
    paginator.innerHTML = rawHTML
}

function getUsersByPage(page) {
    const data = filteredUsers.length ? filteredUsers : users
    const startIndex = (page - 1) * USERS_PER_PAGE
    return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

function switchPanelMode(mode) {
    if (userDataPanel.dataset.mode === mode) return
    userDataPanel.dataset.mode = mode
}

// render Main Body & Pagination
axios.get(INDEX_URL)
    .then((response) => {
        users.push(...response.data.results)
        renderPaginator(users.length)
        renderUserList(getUsersByPage(1))
    })
    .catch((error) => console.error(error))

// addEventListener on userDataPanel
userDataPanel.addEventListener('click', function onPanelClicked(e) {
    if (e.target.tagName === ('IMG')) {
        // 1.when user avatar clicked, show user info
        showUserInfo(Number(e.target.dataset.id))
    } else if (e.target.matches('.btn-add-favorite')) {
        // 2.when heart+ button clicked, add user to favorite list
        addToFavorite(Number(e.target.dataset.addFavoriteId))
    }
})

// show user card by search results
searchForm.addEventListener('submit', function onSearchFormSubmitted(e) {
    e.preventDefault()
    const keyword = searchInput.value.trim().toLowerCase()
    filteredUsers = users.filter(user => user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))
    if (filteredUsers.length === 0) {
        return alert('Cannot find users with keyword : ' + keyword)
    }
    renderPaginator(filteredUsers.length)
    renderUserList(getUsersByPage(1))
})

// show user card by page
paginator.addEventListener('click', function onPaginatorClicked(e) {
    if (e.target.matches('.number-of-page')) {
        currentPage = e.target.dataset.page
        renderUserList(getUsersByPage(currentPage))
    }
})

// switch the arrangement of user data panel
buttonOfArrangement.addEventListener('click', function onButtonClicked(e) {
    if (e.target.matches('.small-card')) {
        switchPanelMode('small-card')
    } else if (e.target.matches('.big-card')) {
        switchPanelMode('big-card')
    }
    renderUserList(getUsersByPage(currentPage))
})