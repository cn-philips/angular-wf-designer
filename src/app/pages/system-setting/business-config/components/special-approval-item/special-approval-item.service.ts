import { Injectable } from '@angular/core';
import { HttpService } from '@core/services'

function formatResponse(res) {
  if ('0000' === res['code']) {
    return res.data
  } else {
    throw new Error(res.msg) 
  }
}


@Injectable({providedIn: 'root'})
export class SpecialApprovalItemService {
  constructor(private http: HttpService) { }
  

  async getItems(params) {
    const url = `/act/ecos/spproject`
    const res = await this.http.get(url, { params }).toPromise()
    return formatResponse(res)
  }

  async updateItem(data) {
    const url = `/act/ecos/spproject`
    const res = await this.http.put(url, data).toPromise()
    return formatResponse(res)
  }

  async addItem(data) {
    const url = `/act/ecos/spproject`
    const res = await this.http.post(url, data).toPromise()
    return formatResponse(res)
  }

  async deleteItem(id) {
    const url = `/act/ecos/spproject/${id}`
    const res = await this.http.delete(url).toPromise()
    return formatResponse(res)
  }
} 