<template>
  <div>
    <a-modal
      width="80%"
      title='分配用户'
      okText='分配'
      cancelText='取消'
     :visible="visible"
      @ok="() =>handleConfirm()"
      @cancel="() => handleCancel()"
    >
          <a-card>
            <a-form layout="horizontal">
               <a-row>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="用户编号" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                        <a-input placeholder="输入用户编号搜索" v-model="filter.loginName"/> 
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="用户名" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                        <a-input placeholder="输入用户名模糊搜索"  v-model="filter.userName"/> 
                    </a-form-item>
                  </a-col>
                </a-row>
                 <a-row>
                    <a-button type="primary" key="query" @click="query">查询</a-button>
                    <a-button style="margin-left: 8px" @click="reset">重置</a-button>
                 </a-row>
            </a-form>
            <div>
                 <a-table
                    :columns="columns"
                    :rowKey="record => record.id"
                    :dataSource="dataSource"
                    :pagination="pagination"
                    :selectedRows="selectedRows"
                    :loading="loading"
                    @change="handleTableChange"
                    :rowSelection="rowSelection"
                  >
                  </a-table>
             </div>
          </a-card>
   </a-modal>
  </div>
</template>


<script>
  //查询未绑定到角色下的用户列表
 import StandardTable from "../../components/table/StandardTable";
 import { findUserPagingNoAssign }  from "../user/UserService";
 import { assignUserToRole }  from "./UserRoleService";

 const columns = [
  {
    title: "用户编码",
    dataIndex: "loginName"
  },
  {
    title: "用户名称",
    dataIndex: "userName"
  },
  {
    title: "创建时间",
    dataIndex: "createAt"
  },
   {
    title: "创建人",
    dataIndex: "createAtBy"
  }
]
const dataSource = []

export default {
  name: "UserRoleModal",
  props: ['assignOkCallback'],
  data () {
    return {
      visible: false,
      columns: columns,
      dataSource: dataSource,
      selectedRowKeys: [],
      selectedRows: [],
      selectedUserIds: [],
      loading: false,
      pagination: {
        total: 0,
        pageSize: 10,
        current: 1,
        sortColumn: null,
        sort: 1
      },
      roleId:undefined,
      filter:{
        loginName:"",
        userName:"",
      },
     
    }
  },
  mounted() {
    console.log("user role  modal mounted");
    console.log(this.visible);
  },
   computed: {
    rowSelection() {
      let self = this;
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          self.selectedUserIds = selectedRows.map(x => x.id);
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows, ", self.selectedUserIds is ", self.selectedUserIds);
        },
        getCheckboxProps: record => ({
          props: {
            disabled: record.name === 'Disabled User Role', // Column configuration not to be checked
            name: record.name,
          }
        }),
      }
    },
  },
  destroyed() {
    console.log("user role  modal destroyed");
  },
  beforeUpdate() {
    console.log("user role  modal beforeUpdate");
  },
  methods: {
    showModal (roleId) {
      this.visible = true
      this.roleId = roleId
      this.loadUser(1);
    },
    reset(){
      this.filter.loginName = ""
      this.filter.userName = ""
      console.log("reset");
    },
    query(){
      this.loadUser(1)
    },
    loadUser (pageNo) {
      let self = this;
      let p = self.pagination;
      let currentPageNo = pageNo ? pageNo : p.current;
      let criteria = {};
      if(this.roleId){
        criteria.roleId = this.roleId;
      }
      if(this.filter.loginName){
        criteria.loginName = this.filter.loginName;
      }
      if(this.filter.userName){
        criteria.userName = this.filter.userName;
      }

      let pageReq = {
        pagination: {totalSize: p.total, pageSize: p.pageSize, pageNo: currentPageNo},
         criteria
      };
      self.selectedRowKeys = [];
      console.log("query user role param  is : \n"+JSON.stringify(pageReq));
     findUserPagingNoAssign(pageReq)
      .then(res => {
        self.loading = false;
        if (res.status === 0) {
          let ret = res.data;
          self.dataSource = ret.rows;
          let pag = ret.pagination;
          self.pagination = {total: pag.totalSize, pageSize: pag.pageSize, current: pag.pageNo};
        } else {
          this.$message.error("获取数据错误");
        }
      })
      .catch(err => {
        self.loading = false;
        this.$message.error("获取数据错误");
        console.log(`err is ${err}`);
      });

      
    },
    handleCancel  () {
      this.visible = false
      this.roleId = undefined
    },
    handleConfirm  () { 
        let self = this;
        let userIds = [...self.selectedUserIds];
        let size = userIds ? userIds.length : 0;
        if (!size || size == 0) {
          this.$message.info("请选中需要分配的用户");
          return;
        }
        self.loading = true;
        assignUserToRole(this.roleId,userIds)
          .then(res => {
            self.loading = false;
            if (res.status === 0) {
               if (self.assignOkCallback && typeof self.assignOkCallback === 'function') {
                  self.visible = false;
                  self.assignOkCallback();
               }
               this.$message.success("分配用户成功");
            } else {
              this.$message.error("分配用户错误");
            }
          })
          .catch(err => {
            self.loading = false;
            this.$message.error("分配用户错误");
            self.loading = false;
            console.log(`err is ${err}`);
          });
       
        
    },
  },
}
</script>
