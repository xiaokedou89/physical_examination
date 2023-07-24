const getters = {
  getterTest: state => state.home.test + 1,
  token: state => state.user.token
}

export default getters