import axios from 'axios'

async function show (params) {
  try {
    const search = await axios
      .get('/douban/search', { params })
    const subjects = search.data.subjects
    if (!subjects || !subjects[0]) return false
    const info = await axios
      .get(`/douban/subject/${subjects[0].id}`)
    return info.data
  } catch (err) {
    const msg = err.response.data.msg
    if (msg) console.log(msg)
    return false
  }
}

export default {
  show
}
