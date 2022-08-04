class FetchError extends Error{
  constructor(error){
    super(error.message)
    this.error = error
  }
}

exports.FetchError = FetchError
