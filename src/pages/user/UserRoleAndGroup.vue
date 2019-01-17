<template>
  <a-drawer
    title="查看用户组和角色"
    width=720
    placement="left"
    :closable="false"
    @close="closeDrawer"
    :visible="visible"
    style="height: calc(100% - 55px);overflow: 'auto';paddingBottom: 53px"
  >
    <a-tabs defaultActiveKey="1" @change="callback">
        <a-tab-pane tab="已分配用户组" key="1">
            <a-table
            :columns="groupColumns"
            :rowKey="record => record.id"
            :dataSource="groupDataSource"
            :pagination="groupPagination"
            :selectedRows="groupSelectedRows"
            :loading="loading"
            @change="handleGroupTableChange"
          >
          </a-table>
        </a-tab-pane>
        <a-tab-pane tab="已分配角色" key="2" >
          <a-table
            :columns="roleColumns"
            :rowKey="record => record.id"
            :dataSource="roleDataSource"
            :pagination="rolePagination"
            :selectedRows="roleSelectedRows"
            :loading="loading"
            @change="handleRoleTableChange"
          >
          </a-table>
        </a-tab-pane>

    </a-tabs>

  </a-drawer>
</template>
<script>
  import {request} from "../../utils/RestClient";
  import moment from 'moment';
  import * as userService from "./UserService";
  import * as sysCodeService from "../syscode/SysCodeService";
  import * as commonUtil from "../../utils/common_util";

  const groupDataSource=[];
  //用户组列表名
  const groupColumns = [
    {
      title: "用户组编码",
      dataIndex: "userGroupCode",
      width: 160
    },
    {
      title: "用户组名称",
      dataIndex: "userGroupName",
      width: 120
    },
    {
      title: "所属系统",
      dataIndex: "systemId"
      ,width: 120
    },
    {
      title: "分配人",
      dataIndex: "lastModifiedBy"
      ,width: 160
    },
    {
      title: "分配时间",
      dataIndex: "lastModifiedAt"
      ,width: 120
    }
  ];
  const groupPagination = {
    total: 0,
      pageSize: 10,
      current: 1,
      sortColumn: null,
      sort: 1
  };
  const roleDataSource=[];
  const roleColumns = [
    {
      title: "角色编码",
      dataIndex: "roleCode",
      width: 160
    },
    {
      title: "角色名称",
      dataIndex: "roleName",
      width: 120
    },
    {
      title: "分配人",
      dataIndex: "lastModifiedBy"
      ,width: 160
    },
    {
      title: "分配时间",
      dataIndex: "lastModifiedAt"
      ,width: 120
    }
  ];
  const rolePagination = {
    total: 0,
    pageSize: 10,
    current: 1,
    sortColumn: null,
    sort: 1
  };
  export default {
    name: "UserRoleAndGroup",

    data () {
      return {
        visible: false,
        userId: null,
        groupDataSource: groupDataSource,
        groupColumns: groupColumns,
        groupPagination: groupPagination,
        roleDataSource: roleDataSource,
        roleColumns: roleColumns,
        rolePagination: rolePagination


      }
    },
    mounted() {

    },
    methods: {
      showDrawer (userId) {
        this.visible = true;
        this.userId = userId;
        this.reloadUserGroup(1);
        this.reloadUserRole(1);
      },
      closeDrawer(){
        this.visible = false;
      },
      reloadUserGroup(pageNo){
        let self = this;
        let pagination = self.groupPagination;
        let currentPageNo = pageNo ? pageNo : pagination.current;
        let criteria = {userId: self.userId};

        console.log("reloadTable triggered ", criteria, ", ", pagination);
        let pageReq = {
          pagination: {totalSize: pagination.total, pageSize: pagination.pageSize, pageNo: currentPageNo},
          criteria
        };
        self.groupSelectedRows = [];

        userService.findGroupPagingByUserId(pageReq)
          .then(resp=>{
            if (resp.status === 0) {
              let ret = resp.data;
              self.groupDataSource = ret.rows;
              let pag = ret.pagination;
              self.groupPagination = {total: pag.totalSize, pageSize: pag.pageSize, current: pag.pageNo};
            } else {
              this.$message.error("获取数据错误");
            }
          }).catch(err=>{
          this.$message.error("获取数据错误");
          console.log(`err is ${err}`);
        })
      },
      reloadUserRole(pageNo){
        let self = this;
        let pagination = self.rolePagination;
        let currentPageNo = pageNo ? pageNo : pagination.current;
        let criteria = {userId: self.userId};

        console.log("reloadTable triggered ", criteria, ", ", pagination);
        let pageReq = {
          pagination: {totalSize: pagination.total, pageSize: pagination.pageSize, pageNo: currentPageNo},
          criteria
        };
        self.roleSelectedRows = [];

        userService.findRolePagingByUserId(pageReq)
          .then(resp=>{
            if (resp.status === 0) {
              let ret = resp.data;
              self.roleDataSource = ret.rows;
              let pag = ret.pagination;
              self.rolePagination = {total: pag.totalSize, pageSize: pag.pageSize, current: pag.pageNo};
            } else {
              this.$message.error("获取数据错误");
            }
          }).catch(err=>{
          this.$message.error("获取数据错误");
          console.log(`err is ${err}`);
        })
      },
      handleGroupTableChange(pagination, filters, sorter) {
        console.log(pagination);
        const pager = { ...this.groupPagination };
        pager.current = pagination.current;
        pager.sortColumn = sorter.field;
        pager.sort = sorter.order == 'descend' ? 2 : 1;

        this.groupPagination = pager;

        this.reloadUserGroup();
      },
      handleRoleTableChange(pagination, filters, sorter) {
        console.log(pagination);
        const pager = { ...this.rolePagination };
        pager.current = pagination.current;
        pager.sortColumn = sorter.field;
        pager.sort = sorter.order == 'descend' ? 2 : 1;

        this.rolePagination = pager;

        this.reloadUserRole();
      }
    },


    render () {
      console.log('UserRoleAndGroup in, this.visible is ', this.visible)

    }
  }
</script>
