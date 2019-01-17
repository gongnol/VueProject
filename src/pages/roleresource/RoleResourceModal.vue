<template>
    <a-modal
      width="80%"
      title='更新角色资源'
      okText='更新'
      cancelText='取消'
     :visible="visible"
      @ok="() =>handleConfirm()"
      @cancel="() => handleCancel()"
    >
            <div>
                <a-row>
                    <a-col :md="6" :sm="18">
                        <div class="primary" v-if="roleName">当前角色:{{roleName}}</div>
                    </a-col>
                </a-row>
                <a-row>
                      <a-tree
                      :checkable="checkable"
                      :checkStrictly="checkStrictly"
                      :multiple="multiple"
                      @expand="onExpand"
                      :autoExpandParent="autoExpandParent"
                      v-model="checkedKeys"
                      :expandedKeys="expandedKeys"
                      @check="onCheck"
                      :treeData="treeData"
                      >
                      </a-tree>
                  </a-row>
            </div>


    </a-modal>
</template>
<script>
import * as resourceService  from "../resource/ResourceService"
import {updateRoleResrouces}  from "./RoleResourceService"
export default {
  name: "RoleResourceModal",
  props:["assignOkCallback"],
  data () {
    return {
      visible: false,
      loading : false,
      roleId:undefined,
      roleResourceKeys:[],
      checkable:true,
      multiple:false,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      checkStrictly:true,
      treeData:[],
      //需要删除的资源
      deleteResourceIds:[],
      //需要添加的资源
      addResourceIds:[],

     }
  },
  mounted() {
    console.log("user role  modal mounted");
  },
  methods: {
    showModal (roleId,roleName,roleResourceKeys) {
      this.visible = true
      this.roleId = roleId
      this.roleName = roleName
       this.roleResourceKeys = roleResourceKeys
      this.reloadTree()
    },
     onExpand (expandedKeys) {
      console.log('onExpand', expandedKeys)
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
     onCheck (checkedKeys, info) {
      this.checkedKeys = checkedKeys.checked
    },
     //加载资源树
    reloadTree(){
        let self = this;
        self.loading = true 
        self.expandedKeys=[]
        self.treeData = [] 
        self.checkedKeys=[]
        resourceService.findResourceTree()
        .then(res => {
          self.loading = false;
          if (res.status === 0) {
             self.expandedKeys = self.roleResourceKeys
             self.checkedKeys = self.roleResourceKeys
             if(res.data!=null){
                res.data.disabled = true
             }
             self.treeData.push(res.data);
             console.log(res.data);
          } else {
            self.$message.error("获取资源错误") 
          }
        })
        .catch(err => {
          self.loading = false;
          self.$message.error("获取资源错误") 
          console.log(`err is ${err}`);
        });
    },
    //计算变化的资源 计算出需要删除的和需要添加的
    calculateChanges(){
        this.addResourceIds = []
        this.deleteResourceIds = []
        console.log(this.checkedKeys.length);
        //如果选中的有  
        if(this.checkedKeys){
           if(this.checkedKeys.toString() !== this.roleResourceKeys.toString()){
            console.log("两个数组不同")
             this.checkedKeys.map(item=>{
                  if(!this.roleResourceKeys.includes(item)){
                      this.addResourceIds.push(item)
                  }
              })
              this.roleResourceKeys.map(item=>{
                 if(!this.checkedKeys.includes(item)){
                    this.deleteResourceIds.push(item)
                 }
              })
           }else{
             console.log("没有发生任何的变动")
           }
        //如果都没有选中
        }else{
            this.deleteResourceIds=this.roleResourceKeys
            this.addResourceIds = []
        }
        console.log(" this.deleteResourceIds  is :"+ this.deleteResourceIds) 
        console.log(" this.addResourceIds is  :"+ this.addResourceIds) 
    },
    handleCancel(){
      this.visible = false
    },
    handleConfirm(){
       let self = this;
       self.calculateChanges()
       if(this.deleteResourceIds.length > 0 || this.addResourceIds.length > 0){
            this.$confirm({
                title: '更新角色资源',
                content: '确定更新该角色资源吗？',
                onOk() {
                      self.loading = true
                      updateRoleResrouces(self.roleId,self.deleteResourceIds,self.addResourceIds)
                      .then(res => {
                        self.loading = false;
                        if (res.status === 0) {
                          self.visible =false
                            self.$message.success("更新角色资源成功") 
                             if (self.assignOkCallback && typeof self.assignOkCallback === 'function') {
                                self.assignOkCallback()
                              }
                        } else {
                          self.$message.error("更新角色资源错误") 
                        }
                      })
                      .catch(err => {
                        self.$message.error("更新角色资源错误") 
                        self.loading = false;
                        console.log(`err is ${err}`) 
                      });
                },
                onCancel() {},
              });
       }else{
         self.loading = false;
         this.$message.info("没有发生任何的变动")
         this.visible = false
       }
    }

  }
}
</script>
<style lang="less" scoped>

.primary{
  color:#1890ff;
  font-size:16px;
  font-weight: bold;
}
</style>