'use strict';

import './popup.css';

(function () {


  document.getElementById("showList").addEventListener('click',()=>{
    var list = document.getElementById("list");
    var header = document.getElementById("showList");
    if (list.style.display === "none"){
    header.innerText = "Hide list"
    list.style.display = "block";
  }else{
      header.innerText = "Show list"
    list.style.display = "none";
  }
});

  function getAllTabs() {
    let tabs = [];
    chrome.tabs.query({},(it)=>{
      tabs.push(...tabsToTitles(it))
      tabsToGroups(it).then((it)=>{
        let groups =  [...new Map(it.map(item =>
          [item['id'], item])).values()].filter((it)=>it.title.length !== 0);
        showPrompt(tabs, groups)
      })
    })
  }

  async function tabsToGroups(tabs){
    let groups = (tabs
      .map( (it)=>it.groupId)
      .filter((it)=>it!==null && it!==undefined && it!==-1));

  return await Promise.all(groups
      .map(async (it) => {
      let item = await chrome.tabGroups.get(it)
        return {
          id: item.id,
          title: item.title
        }
    }));
  }

  function tabsToTitles(tabs){
    let res = tabs.map((it)=>{
       return {
        id: it.id,
        title: it.title,
        url: it.url,
        group: it.groupId}
    })
    return res;
  }


  function showPrompt(tabs,groups){
      let doc = document.getElementById("list")
    tabs.forEach((item)=>{
      let li = document.createElement("li");
      li.classList.add("listItem")
      li.innerText = item.title;
      doc.appendChild(li);
    })

    document.getElementById('sortBtn').addEventListener('click',callBackendToSort)
  }

  function callBackendToSort(){
    fetch('http://127.0.0.1:8001/sort',{
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        items: tabs,
        categories: groups
      })
    }).then((response)=>{
      console.log(response)
      //TODO re-add groups to chrome sorted
    }).catch((error)=>{console.log(error)})

  }

  document.addEventListener('DOMContentLoaded', getAllTabs);
})();
