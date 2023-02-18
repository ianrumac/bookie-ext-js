'use strict';

import './popup.css';


(function () {
const SORT_BTN = 'sortBtn';
const LOADING = 'loading';
const ERROR = 'error';


  document.getElementById("showList").addEventListener('click',()=>{
    var list = document.getElementById("list");
    var header = document.getElementById("showList");
    if (list.style.display !== "none"){
      header.innerText = "Show list"
      list.style.display = "none";
    }else{
      header.innerText = "Hide list"
      list.style.display = "block";
  }
});

  async function getTabsAndGroups() {
    let chromeTabs = await chrome.tabs.query({})
    let tabs = await mapTabs(chromeTabs)
    console.log(tabs)
    console.log(tabs.size)
    let tabsWithGroups = await tabsToGroups(tabs)
    let groups =  tabsWithGroups.filter((it)=>it.title.length !== 0);
    return {
      items: tabs,
      categories: groups
    }
  }

  async function tabsToGroups(tabs){
    let groupIds = tabs
      .map((it)=>it.group)
      .filter((it)=>it!==null && it!==undefined && it!==-1);
    let groups = new Set(groupIds)
  return await Promise.all([...groups]
      .map(async (it) => {
      let item = await chrome.tabGroups.get(it)
        return {
          id: item.id,
          title: item.title
        }
    }));
  }

  function mapTabs(tabs){
    return tabs.map((it) => {
      return {
        id: it.id,
        title: it.title,
        url: it.url,
        group: it.groupId
      }
    });
  }
  function show(id){
    let el = document.getElementById(id)
    el.style.display = 'block'
  }
  function hide(id){
    let el = document.getElementById(id)
    el.style.display = 'none'
  }

  function showError(e){
    let btn = document.getElementById('error')
    btn.style.display = 'block'
    btn.innerText = 'Error:'+e.message;
  }




  async function applySort(sortedCategories){
    //assume each category has belonging tabs inside
    for (let i = 0; i < sortedCategories.categories.length; i++) {
      let category = sortedCategories.categories[i]
      let categoryId = category.category_id

      let groupExists = await chrome.tabGroups.get(categoryId).catch((e)=>undefined);
      let groupId;

      if(groupExists === undefined)
         groupId = await chrome.tabs.group({ tabIds: category.items });
      else {
        groupId = groupExists.id
        await chrome.tabs.group({groupId: categoryId, tabIds: category.items});
      }

      await chrome.tabGroups.update(groupId, {
        collapsed: true,
        title: category.title
      });

    }
  }



  async function callBackendToSort(data){
   // return JSON.parse("{\"categories\":[{\"category_id\":1272338432,\"category_name\":\"Chrome\",\"items\":[1322973620]},{\"category_id\":837293847,\"category_name\":\"What's New\",\"items\":[1322973607]},{\"category_id\":837293848,\"category_name\":\"Hacker News\",\"items\":[1322973609]},{\"category_id\":837293849,\"category_name\":\"Travel\",\"items\":[1322973617]},{\"category_id\":837293850,\"category_name\":\"Science\",\"items\":[1322973618]},{\"category_id\":837293851,\"category_name\":\"GitHub\",\"items\":[1322973619]},{\"category_id\":837293852,\"category_name\":\"Android Development\",\"items\":[1322973612,1322973613,1322973614,1322973615,1322973616]},{\"category_id\":837293853,\"category_name\":\"Web APIs\",\"items\":[1322973646]}]}")
   return (await fetch('http://127.0.0.1:8001/sort', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    })).json()
  }

  function render(state){
    console.log(state)
    if(state.loading){
      show(LOADING)
      hide(SORT_BTN)
      hide(ERROR)
    }else{
      hide(LOADING)
      show(SORT_BTN,true)
    }
    if(state.loading!==true && (state.error!==undefined && state.error!=null)){
      show(ERROR)
      showError(state.error)
    }else
      hide(ERROR)
  }

  async function run(){
    let tabsAndGroups = await getTabsAndGroups();
    let btn = document.getElementById('sortBtn')
    render({loading: false});
    btn.addEventListener('click',async ()=> {
      render({loading: true});
      try {
        console.log(tabsAndGroups)
        console.log('callingApi')
        let result = await callBackendToSort(tabsAndGroups)
        console.log(result)
        await applySort(result)
        console.log('Applied sort')
        render({loading: false})
      }catch (e){
        render({loading: false, error: e})
      }
    })
  }

  document.addEventListener('DOMContentLoaded', run);
})();
