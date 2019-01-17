<template>
    <a-card>
      <a-form layout="horizontal">
        <div>
          <a-form layout="horizontal">
            <div :class="advanced ? null: 'fold'">
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
            </div>
           
          </a-form>
          <div>
             <a-row style="float: right; margin-top: 3px;">
                <a-button type="primary"  @click="query">查询</a-button>
                <a-button style="margin-left: 8px" @click="reset">重置</a-button>
              </a-row>
          </div>

           <div class="operator">
             <user-role-modal  ref="userRoleModal"  :assignOkCallback="assignOkCallback"></user-role-modal>
               <a-button type='primary' @click="openUserRoleModal" >添加用户</a-button>
              <a-button  @click="deleteUser">删除</a-button>  
            </div>  
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
      </a-form>
    </a-card>
</template>

<script>
import StandardTable from "../../components/table/StandardTable";
import { deleteUserRoleByRoleId }  from "./UserRoleService";
import {queryUserByRoleId}  from "../user/UserService";
import UserRoleModal from  "./UserRoleModal";


const dataSource=[];
  //分配用户 列表
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
    title: "分配时间",
    dataIndex: "lastModifiedAt"
  },
   {
    title: "分配人",
    dataIndex: "lastModifiedAtBy"
  }
]


export default {
  name: "UserRoleList",
  components: {
    StandardTable,UserRoleModal
  },
  data() {
    return{ 
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
      }
    }
  },
  mounted() {
    console.log("user role mounted");
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
            disabled: record.name === 'Disabled UserRole', // Column configuration not to be checked
            name: record.name,
          }
        }),
      }
    },
  },
methods: {
    showData (roleId) {
        console.log("roleId is " + roleId);
        this.roleId = roleId
        this.reloadTable(1);
    },
    openUserRoleModal(){
      this.$refs.userRoleModal.showModal(this.roleId);
    },
    assignOkCallback(){
      this.reloadTable(1);
    },
    //选中用户 ，删除该角色下的用户关系
    deleteUser(){
      let self = this;
      let userIds = [...self.selectedUserIds];
      let size = userIds ? userIds.length : 0;
      if (!size || size == 0) {
        this.$message.info("请选中需要删除的用户");
        return;
      }
      self.loading = true;
      deleteUserRoleByRoleId(this.roleId,userIds)
        .then(res => {
          self.loading = false;
          if (res.status === 0) {
             this.$message.success("删除用户成功");
          } else {
            this.$message.error("删除用户错误");
          }
           this.reloadTable(1)
        })
        .catch(err => {
          self.loading = false;
          this.$message.error("删除用户错误");
          self.loading = false;
          console.log(`err is ${err}`);
        });
    },
    reset(){
      this.filter.loginName = ""
      this.filter.userName = ""
    },
    query(){
      this.reloadTable(1);
    },
    //根据角色ID  获取该角色下的用户列表
    reloadTable(pageNo) {
      let self = this;
      let p = self.pagination;
      let currentPageNo ;
      if(pageNo == undefined){
        currentPageNo = 1
      }else {
       currentPageNo = pageNo  ? pageNo : p.current;
      }
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
      
       queryUserByRoleId(pageReq)
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

    }
  }
};
</script>