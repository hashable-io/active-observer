function doAbc(input) {
  return (options) => {
    console.log("Magic ABC...")
  }
}

function doXyz(input) {
  return (options) => {
    console.log("Magic XYZ...")
  }
}

const options = {}

// Thunks
doAbc("input ABC")
doXyz("Input XYZ")

// Evaluated 
doAbc("input ABC")(options)
doXyz("Input XYZ")(options)



function compose(f1, f2) {
  return (...args) => {
    return (options) => {
     f2(f1(...args)(options))(options)
    }
  }
}

// Thunk with a single input
compose(doAbc, doXyz)("Input ABC")
compose(doAbc, doXyz)("Input ABC")(options)


