<template>
    <a-card>
      <a-form layout="horizontal">
        <div>
          <div class="operator">
             <role-resource-modal  ref="roleResourceModal"  :assignOkCallback="assignOkCallback"></role-resource-modal>
               <a-button type='primary' @click="openRoleResourceModal" >分配资源</a-button>
            </div>  
            <div>
                  <a-tree
                  :checkable="checkable"
                  :multiple="multiple"
                  @expand="onExpand"
                  :autoExpandParent="autoExpandParent"
                  v-model="checkedKeys"
                  :expandedKeys="expandedKeys"
                  @select="onSelect"
                  :showIcon=true
                  :selectedKeys="selectedKeys"
                  :treeData="treeData"
                  >
                  </a-tree>
            </div>
             
          </div>
      </a-form>
    </a-card>
</template>

<script>
import { request } from "../../utils/RestClient";
import * as resourceService  from "../resource/ResourceService"
import RoleResourceModal from "./RoleResourceModal"

const treeData = []


export default {
  name: "RoleResourceList",
  components: {
    RoleResourceModal
  },
  data() {
    return{ 
      loading :false,
      checkable:false,
      multiple:false,
      showLine:false,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      treeData:treeData,
      allResourceKeys:[],
      roleId:undefined,
      roleName:undefined
    }
  },
  mounted() {
    console.log("user role mounted");
  },
  //  watch: {
  //   checkedKeys(val) {
  //     console.log('onCheck', val)
  //   }
  // },
  methods: {
    //触发查询
    showData (roleId,roleName) {
        console.log("roleId is " + roleId);
        this.roleId = roleId
        this.roleName = roleName
        this.reloadTree();
        
    },
    assignOkCallback(){
      this.reloadTree();
    },
     onExpand (expandedKeys) {
      console.log('onExpand', expandedKeys)
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
     onCheck (checkedKeys) {
      console.log('onCheck', checkedKeys)
      this.checkedKeys = checkedKeys
    },
    onSelect (selectedKeys, info) {
      this.selectId = info.node.dataRef.id
      this.selectedKeys = selectedKeys
    },
    openRoleResourceModal(){
      console.log(this.allResourceKeys,this.roleName);
      this.$refs.roleResourceModal.showModal(this.roleId,this.roleName,this.allResourceKeys)
    },
    //初始化当前用户有哪些节点资源（保存key）
   geneRoleResourceCheks(data){
     if(data){
          if(data.key){
            this.allResourceKeys.push(data.key)

          }
          if(data.children){
              let node = data.children
              for(let i=0 ;i<node.length;i++){
                   this.geneRoleResourceCheks(node[i]);
              }
        }
      }

    },
    //根据角色ID  获取该角色下的用户列表
    reloadTree() {
        console.log("reloadTree....");
        let self = this
        self.treeData = []
        self.allResourceKeys=[]
        self.selectedKeys = []
        self.loading = true
        resourceService.findResourceTreeByRole(self.roleId)
        .then(res => {
          self.loading = false;
          if (res.status === 0) {
            self.treeData.push(res.data);
            self.autoExpandParent = true
            self.geneRoleResourceCheks(res.data);
            console.log(self.allResourceKeys.length,self.allResourceKeys)
            self.expandedKeys = self.allResourceKeys
          } else {
            self.$message.error("获取角色下资源错误");
          }
        })
        .catch(err => {
          self.loading = false;
          self.$message.error("获取角色下资源错误");
          console.log(`err is ${err}`);
        });
    },
   

  }
};
</script>