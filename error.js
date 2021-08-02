module.exports = class FetchError extends Error{
  constructor(error){
    super(error.message)
    this.error = error
  }
}
