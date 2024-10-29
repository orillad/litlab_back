// litlab_back/utils/axios.js
import axios from 'axios'
import { BACKEND_URL } from '../CONSTS.js'

export default axios.create({
  baseURL: BACKEND_URL,
})