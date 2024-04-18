export function compareIgnoreSensitiveCase(str1:String, str2:String){
    str1 = !!str1?str1.toString().trim():"";
    str2 = !!str2?str2.toString().trim():"";
    return str1.toLowerCase() === str2.toLowerCase();
}
