export interface tableColumn{
  name:string,
  width?:any
}
export function getNzScrollXByColumns(columns:tableColumn[]){ 
  let rootNodeFontSize=Number(window.getComputedStyle(document.documentElement)["fontSize"].replace('px',''))
  let resultArr = columns.map(column=>{
    if(column.width){
      if(!isNaN(column.width)){
        return column.width 
      }else{
        let stringifyWith=column.width.toString() 
        if( stringifyWith.indexOf('rem')>-1){
          return Number(stringifyWith.substring(0, stringifyWith.indexOf('rem')))*rootNodeFontSize
        }else if(stringifyWith.indexOf('px')>-1){  
          return Number(stringifyWith.substring(0,stringifyWith.indexOf('px')))
        }
      }
    }
  })
  return resultArr.reduce((pre,next)=>pre+next,0)+'px'
}