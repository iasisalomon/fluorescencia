import { groupBy, chunk } from 'lodash'

export default {
  CHANGE_FILE_NAME(state, payload) {
    state.fileName = payload
  },
  CHANGE_RAW_DATA(state, payload) {
    state.rawData = payload
  },
  CHANGE_RAW_DATA_OBJECT(state, payload) {
    //  remove empty values recursively
    const removeEmpty = (obj) => {
      Object.entries(obj).forEach(
        ([key, val]) =>
          (val && typeof val === 'object' && removeEmpty(val)) ||
          ((val === null || val === '') && delete obj[key]),
      )
      return obj
    }
    let cleanPayload = removeEmpty(payload)
    //  remove empty objects
    cleanPayload = cleanPayload.filter(
      (value) => Object.keys(value).length !== 0,
    )
    state.rawDataObject = cleanPayload
  },
  CLEAR_FILE_NAME(state) {
    state.fileName = ''
  },
  CLEAR_RAW_DATA(state) {
    state.rawData = []
  },
  CLEAR_RAW_DATA_OBJECT(state) {
    state.rawDataObject = []
  },
  SORT_DATA(state) {
    state.sortedData = state.rawData.sort()
  },
  GROUP_BY_WELL_DATA(state) {
    state.groupedbyWellData = groupBy(state.sortedData, 0)
  },
  EXTRACT_WELLS(state) {
    state.extractedWells = Object.keys(state.groupedbyWellData)
  },
  ADJUST_RAW_VALUES(state) {
    state.rawAdjustedValues = Object.entries(state.groupedbyWellData).map(
      (e) => {
        return e[1].map((f) => {
          return f[2] - f[3]
        })
      },
    )
  },
  GET_REPETITION_COUNT(state) {
    state.repetitionCount = state.rawAdjustedValues[0].map((el, index) => {
      return index + 1
    })
  },
  ADJUST_VALUES_AVERAGE(state) {
    state.adjustedValuesAverage = state.rawAdjustedValues.map((e) => {
      return (
        e.reduce((a, b) => {
          return a + b
        }) / e.length
      )
    })
  },
  CHUNK_VALUES_AVERAGE(state) {
    state.chunkAdjustedValues = chunk(
      state.adjustedValuesAverage,
      state.chunkNumber,
    )
  },
  AVERAGE_TABLE_OBJECT(state) {
    const object = state.rawAdjustedValues.map((box, index) => {
      return {
        Well: state.extractedWells[index],
        ...box,
        Average: state.adjustedValuesAverage[index],
      }
    })
    state.averageTableObject = object
  },
  CREATE_MATRIX_NATIVE(state) {
    const assignLetters = []
    for (let i = 0; i < state.wellRows.length; i++) {
      const helper = state.chunkAdjustedValues[i]
      const brelper = [state.wellRows[i], ...helper]
      assignLetters.push(brelper)
    }
    state.matrixNative = assignLetters
  },
  GET_TABLE_HEADER(state) {
    state.tableHeader = state.rawData.shift()
  },
  CLEAR_TABLE_HEADER(state) {
    state.tableHeader = []
  },
  OBTAIN_WELL_ROWS(state) {
    state.wellRows = state.extractedWells.map((el) => {
      return el.replace(/[^a-zA-Z]/, '')
    })
    state.wellRows = [...new Set(state.wellRows)]
  },
  OBTAIN_WELL_COLS(state) {
    state.wellCols = state.extractedWells.map((el) => {
      return el.replace(/[a-zA-Z]/, '')
    })
    state.wellCols = [...new Set(state.wellCols)]
  },
  GET_CHUNK_NUMBER(state) {
    state.chunkNumber = state.wellCols.length
  },
}
