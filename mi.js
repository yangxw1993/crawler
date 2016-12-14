/**
 * Created by chris on 2016/12/6.
 */
var http = require('http'),
    fs = require('fs'),
    request = require('request'),
    cheerio = require('cheerio');
var i = 0;
var url = 'http://www.mi.com/quantie/';
var hostname = 'http://www.mi.com';

function fetchPage(x) {
    startRequest(x);
}
function startRequest(x) {
    //采取http模块向服务器发起一次get请求
    http.get(x, function (res) {
        var html = '';//存储整个网页HTML内容
        var title = [];
        res.setEncoding('utf-8');

        //监听data事件，每次获取一块数据
        res.on('data', function (chunk) {
            html += chunk;
        });

        //监听end事件，如果整个网页的HTML都获取完毕，执行回调函数
        res.on('end', function () {
            var $ = cheerio.load(html);//采用cheerio模块解析HTML
            var price = $('.price span').text().trim() + '元';
            var newsTime = {
                //获取文章标题
                title: $('h2').text().trim(),
                //获取文章发布价格
                Price: price,
                //获取多少篇文章
                i: i = i + 1
            };

            //获取文章表题
            var newsItem = $('h2').text().trim();
            saveContent($, newsItem);

        })

    }).on('error', function (err) {
        console.log(err);
    })
}
//在本地存储爬取的新闻内容
function saveContent($, newsItem) {
    $('h2').each(function (index, item) {
        var x = $(this).text().trim();
        console.log(x);
        var y = x.substring(0, 2).trim();
        fs.writeFile('./data2/' + x + '.txt', x, 'utf-8', function (err) {
            if (err) {
                console.log("保存出错：" + err);
            }
        });
    })
}

//在本地存储爬取到的图片资源
/*function saveImg($,newsTitle){
 $('img').each(function(index,item){
 var imgTitle=$(this).parent().next().text().trim();//获取图片表题
 if(imgTitle.length>35||imgTitle==''){
 imgTitle='null';
 }
 var imgFileName=imgTitle+'.jpg';
 var imgUrl=hostname+$(this).attr('src');//获取图片URL

 //采用request模块，向服务器发起一次请求，获取图片资源
 request.head(imgUrl,function(err,res,body){
 if(err){
 console.log(err);
 }
 });
 //通过留的方式吧图片存到本地images文件夹下，并用新闻和图片的表题命名
 request(imgUrl).pipe(fs.createWriteStream('./images/'+newsTitle+'--'+imgFileName));
 })
 }*/
fetchPage(url);