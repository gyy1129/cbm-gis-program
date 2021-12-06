<template>
  <div id="main-attributes">
    <div id="main-attributes-title">
      <span>&nbsp;属性表</span>
    </div>
    <div id="main-attributes-container"></div>
  </div>
</template>

<script>
export default {
  name: 'Attributes',
  data() {
    return {}
  }
}
</script>

<style>
#main-attributes {
  width: 12%;
  height: 55%;
  position: fixed;
  right: 2%;
  top: 15%;
  border-radius: 4px;
  background: #fff;
  box-shadow: 3px 3px 5px #787878;
  overflow-y: auto;
  overflow-x: hidden;
  transition: 0.1s ease;
  opacity: 0;
  z-index: 5;
}
#main-attributes-title {
  height: 26px;
  display: flex;
  flex-flow: nowrap row;
  align-items: center;
  font-weight: 600;
  color: #fff;
  font-size: 14px;
  background: #404765;
  margin-bottom: 5px;
}
#main-attributes-container {
  width: 100%;
  height: 90%;
}
#main-attributes-container .attrLine {
  width: 100%;
  font-size: 12px;
  display: flex;
}
#main-attributes-container .attrLineLeft {
  width: 45%;
  font-style: italic;
  font-weight: 300;
  color: rgba(55, 55, 55, 0.8);
}
#main-attributes-container .attrLineRight {
  width: 55%;
  font-weight: 400;
  color: rgba(33, 33, 33, 0.8);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
#main-attributes-container .attrLineRight:hover {
  white-space: normal;
}
</style>
