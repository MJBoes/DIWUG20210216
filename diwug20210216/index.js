const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    if(!req.query.barcode||!req.query.max){
        context.res = { status:400,body:"Please pass a barcode and max returned"}
    }else{
        icount=1;
        lines=[];
        context.log('https://www.whiskybase.com/search?q='+req.query.barcode);
        const searchpage=await axios.get('https://www.whiskybase.com/search?q='+req.query.barcode).then(result=>cheerio.load(result.data));
        while(icount<=Math.min(req.query.max,searchpage('.clickable').length)){
            line={url:searchpage('.clickable')[icount-1].attribs['href']};
            detailspage=await axios.get(line.url).then(result=>cheerio.load(result.data));
            line['name']=detailspage('header h1').text().toString().replace(/\t/g, '').replace(/\n/g, ' ').trim();
            detailspage('.block-desc dl').each((i,element)=>{
                dd='';dt=''
                detailspage(element.childNodes).each((i2,elem)=>{
                    if(elem.name=='dt'){dt=detailspage(elem).text()}
                    if(elem.name=='dd'){
                        dd=detailspage(elem).text()
                        line[dt]=dd;
                    }
                })
            });
            icount+=1;
            lines.push(line);
        };
        const responseMessage = JSON.stringify(lines);
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: responseMessage
        };
    
    }
}