<template>
<a-card>
     <div :class="advanced ? 'search' : null">
       <a-form layout="horizontal">
        <div :class="advanced ? null: 'fold'">
           <a-row>
            <a-col :md="8" :sm="24">
                  
            </a-col>
          </a-row>
        </div>
        <a-row >
          <a-button type="primary"  @click="reloadTree()">查询</a-button>
          <a-button type="primary"  @click="allExpand()">全部展开/折叠  </a-button>
          <a-button style="margin-left: 8px" @click="reset()">重置</a-button>
        </a-row>
      </a-form>
    </div>

    <div>
        <div class="operator">
          <a-input-search  style="width: 200px" placeholder="关键字搜索" @change="onChange" />
          <resource-add-modal  ref="resourceAddModal"  :addOkCallback="addOkCallback"></resource-add-modal>
          <resource-update-modal ref="resourceUpdateModal" :updateOkCallback="updateOkCallback"></resource-update-modal>
          <a-button type='primary'  title="选中一条资源添加该资源下的子资源"  @click="openAddResource()">添加资源</a-button>
          <a-button type='primary'   title="选中一条资源，修改该资源的信息"  @click="openUpdateResource()">修改资源</a-button>
          <a-button @click="deleteResource" >删除</a-button>  
          <a-button type='primary' title="选中一条资源，查询该资源下的用户和角色"  @click="queryUserRole()">查询已分配角色和用户组</a-button>
          
        </div>

        <div>
          <a-tree
          :checkable="checkable"
          :multiple="multiple"
          @expand="onExpand"
          :autoExpandParent="autoExpandParent"
          :expandedKeys="expandedKeys"
          @select="onSelect"
          :showIcon=true
          :selectedKeys="selectedKeys"
          :treeData="treeData"
        >
          <template slot="title" slot-scope="{title}">
            <span v-if="title.indexOf(searchValue) > -1">
              {{title.substr(0, title.indexOf(searchValue))}}
              <span style="color: #f50">{{searchValue}}</span>
              {{title.substr(title.indexOf(searchValue) + searchValue.length)}}
            </span>
            <span v-else>{{title}}</span>
          </template>
          </a-tree>
    </div>
    <div class="user_role_tab">
        <div  v-show="showTabs"  class="primary" >所选资源：{{resourceName}}</div>
        <a-tabs defaultActiveKey="1"  v-show="showTabs" @change="callback">
           <a-tab-pane tab="已关联角色" key="1" >
            <resource-role-list ref="resourceRoleList"></resource-role-list> 
          </a-tab-pane>
          <a-tab-pane tab="已分配用户" key="2" forceRender>
               <!--  <resource-user-list ref="resourceUserList"></resource-user-list> -->
          </a-tab-pane>
         
        </a-tabs>
    </div>
  </div>
  </a-card>
</template>
<script>
import { request } from "../../utils/RestClient";
import * as resourceService  from "./ResourceService"
import ResourceAddModal from "./ResourceAddModal";
import ResourceUpdateModal from "./ResourceUpdateModal";
import ResourceRoleList from "../roleresource/ResourceRoleList";


export default {
  name:"ResourceList",
  components: {
    ResourceAddModal,ResourceUpdateModal,ResourceRoleList,
  },
  data () {
    return {
       showTabs:false,
      checkable:false,
      advanced:true,
      multiple:false,
      showLine:false,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      treeData:[],
      searchValue: '',
      dataList:[],
      selectId:"",
      resourceName:"",
      selectNode:{},
      deleteResourceIds:[],
      allNodeKeys:[],
    }
  },
  watch: {
    checkedKeys(val) {
      console.log('onCheck', val)
    }
  },
   mounted() {
    console.log("resource mounted");
    this.reloadTree();
  },
  methods: {
    //展开事件
    onExpand (expandedKeys) {
      console.log('onExpand', expandedKeys)
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    //勾选事件
    onCheck (checkedKeys) {
      console.log('onCheck', checkedKeys)
      this.checkedKeys = checkedKeys
    },
    //选中事件
    onSelect (selectedKeys, info) {
      console.log('onSelect === ', info.node.dataRef.id)
      this.selectId = info.node.dataRef.id
      this.selectNode = info.node.dataRef
      this.selectedKeys = selectedKeys
      console.log('selectNode  === ',this.selectNode)
    },
    //获取该资源下有哪些用户和角色
    queryUserRole(){
        if(this.selectNode.id){
          this.showTabs = true;
           this.resourceName = this.selectNode.title;
          this.$refs.resourceRoleList.showData(this.selectId);
        }else{
           this.$message.info("请点击选中一条资源");
        }
    },
    //全部展开/折叠
    allExpand(){
      if(this.expandedKeys.length>0){
        this.expandedKeys = []
      }else{
        this.expandedKeys = this.allNodeKeys
      }
    },
    //修改成功
    updateOkCallback(){
      this.reloadTree();
    },
    addOkCallback(){
        this.reloadTree();
    },
    //获取所有的子节点 ID
    getAllChildIds(data){
      if(data){
        this.deleteResourceIds.push(data.id)
        if(data.key){
          this.allNodeKeys.push(data.key);
        }
        if(data.children){
          let node = data.children
            for(let i=0 ;i<node.length;i++){
                 this.getAllChildIds(node[i]);
            }
        }
      }
      
    },
    //根据选中的ID 获取该节点以及子节点
    getNodeChilds(data,id){
       if(data){
         for(let i = 0 ; i < data.length ;i++){
            let node = data[i]
            if(node.id == id){
               return node
            }else if(this.getNodeChilds(node.children,id)){
                return this.getNodeChilds(node.children,id)
            }
          } 
       }
    },
    //点击删除 ，有提示
    deleteResource(){
      let self = this;
      if(!this.selectNode.key){
            this.$message.info("请点击选中一条资源删除");
              return;
      }
      self.deleteResourceIds = []
     let node = self.getNodeChilds(self.treeData,self.selectNode.id);
     self.getAllChildIds(node);
     let content = ""
     if(self.deleteResourceIds.length > 1 ){
        content = '确定删除该资源及其子资源吗？'
     }else{
        content = '确定删除该资源吗？';
     }
      this.$confirm({
        title: '删除资源',
        content: content,
        onOk() {
             self.loading = true
             resourceService.deleteResource(self.deleteResourceIds)
            .then(res => {
              self.loading = false;
              if (res.status === 0) {
                self.$message.success("删除资源成功");
                self.reloadTree();
              } else {
                self.$message.error("获取资源错误");
              }
            })
            .catch(err => {
              self.loading = false;
              this.$message.error("获取资源错误");
              console.log(`err is ${err}`);
            });
        },
        onCancel() {},
      });
    },
    //打开修改资源
    openUpdateResource(){
      if(!this.selectNode.key){
        this.$message.info("请点击一条资源")
      }else if(!this.selectNode.id){
          this.$message.info("资源清单不可修改,您可以选择一条子资源修改")
      }else{
        this.$refs.resourceUpdateModal.showModal(this.selectNode.id)
      }
    },
    //打开添加资源按钮方法
    openAddResource(){
      if(this.selectedKeys.length > 1 ){
          this.$message.info("最多选择一条资源然后添加");
          return;
      }
      if(this.selectedKeys.length == 0   && this.treeData){
         this.$message.info("请选择一条资源然后添加");
          return;
      }
      console.log(this.selectedKeys[0]);
      let resParentCode = this.selectedKeys[0];
      this.$refs.resourceAddModal.showModal(this.selectNode.code);
    },
    //加载资源树
    reloadTree(){
        let self = this;
        self.treeData = [];
        self.allNodeKeys = []
        self.expandedKeys = []
        resourceService.findResourceTree()
        .then(res => {
          self.loading = false;
          if (res.status === 0) {
            self.visible = false
            self.treeData.push(res.data);
            console.log(JSON.stringify(res.data));
            self.autoExpandParent = true
            self.generateList(self.treeData)
            self.getAllChildIds(res.data);
           self.expandedKeys = self.allNodeKeys;
            console.log("this dataList is " + JSON.stringify(self.dataList));
          } else {
            self.$message.error("获取资源错误");
          }
        })
        .catch(err => {
          self.loading = false;
          self.$message.error("获取资源错误");
          console.log(`err is ${err}`);
        });
    },
    //初始化搜索
    generateList (data){
        for (let i = 0; i < data.length; i++) {
          const node = data[i]
          const key = node.key
          this.dataList.push({ key, title: node.title })
          if (node.children) {
             this.generateList(node.children, node.key)
          }
        }
    },
    //获取父key
    getParentKey(key, tree) {
      let parentKey
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i]
        if (node.children) {
          if (node.children.some(item => item.key === key)) {
            parentKey = node.key
          } else if (this.getParentKey(key, node.children)) {
            parentKey = this.getParentKey(key, node.children)
          }
        }
      }
      return parentKey
    },
    //搜索定位树
     onChange (e) {
      const value = e.target.value
      console.log("value is "+value);
      const expandedKeys = this.dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          console.log(item.key+" == "+item.title+" <> "+value);
          return this.getParentKey(item.key, this.treeData)
        }
        return null
      }).filter((item, i, self) => item && self.indexOf(item) === i)
      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true,
      })
    },

  },
}

</script>

<style lang="less" scoped>
.search {
  margin-bottom: 54px;
}
.user_role_tab{
  margin-top:30px;
}

.primary{
  color:#1890ff;
  font-size:16px;
  font-weight: bold;
}
.fold {
  width: calc(100% - 216px);
  display: inline-block;
}

@media screen and (max-width: 900px) {
  .fold {
    width: 100%;
  }
}
</style>
