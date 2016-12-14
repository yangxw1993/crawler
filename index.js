/**
 * Created by chris on 2016/12/6.
 */
var http = require('http'),
    fs = require('fs'),
    request = require('request'),
    cheerio = require('cheerio');
var i = 0;
var url = 'http://www.ss.pku.edu.cn/index.php/newscenter/news/2391';
var hostname='http://www.ss.pku.edu.cn';

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
        res.on('data',function(chunk){
            html+=chunk;
        });

        //监听end事件，如果整个网页的HTML都获取完毕，执行回调函数
        res.on('end',function(){
            var $=cheerio.load(html);//采用cheerio模块解析HTML
            var time=$('.article-info a:nth-child(1)').next().text().trim();
            var newsTime={
                //获取文章标题
                title:$('.article-title a').text().trim(),
                //获取文章发布时间
                Time:time,
                //获取当前文章的URL
                link:hostname+$('.article-title a').attr('href'),
                //获取供稿单位
                author:$('[title=供稿]').text().trim(),
                //获取多少篇文章
                i:i=i+1
            }

            //获取新闻信息
            var newsItem= $('div.article-title a').text().trim();
            console.log(newsItem);
            saveContent($,newsItem);
            saveImg($,newsItem);

            //获取下一篇文章的URL
            var nextLink=hostname+$('li.next a').attr('href');
            str1=nextLink.split('-');//去掉中文,为数组，
            str=encodeURI(str1[0]);
            if(i<=500){
                fetchPage(str);
            }
        })

    }).on('error',function(err){
        console.log("执行出错："+err);
    })
}
//在本地存储爬取的新闻内容
function saveContent($,newsItem){
    $('.article-content p').each(function(index,item){
        var x=$(this).text();
        var y= x.substring(0,2).trim();
        if(y==''){
            x=x+'\n';
            fs.appendFile('./data/'+newsItem+'.txt',x,'utf-8',function(err){
                if(err){
                    console.log("保存出错："+err);
                }
            });
        }
    })
}

//在本地存储爬取到的图片资源
function saveImg($,newsTitle){
    $('.article-content img').each(function(index,item){
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
}
fetchPage(url);