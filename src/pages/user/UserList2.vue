<template>
  <a-card>
    <div :class="advanced ? 'search' : null">
      <a-form layout="horizontal">
        <div :class="advanced ? null: 'fold'">
          <a-row>
            <a-col :md="8" >
              <a-form-item label="用户登录名" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                <a-input placeholder="请输入用户登录名" v-model.trim="criteria.loginName"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" >
              <a-form-item label="中文名" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                <a-input placeholder="请输入中文名" v-model="criteria.userName"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" >
              <a-form-item label="用户类型" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                <a-select placeholder="请选择" v-model="criteria.userType">
                  <a-select-option :value="userType.itemCode" v-for="(userType, index) in userTypeList" :key="index">{{userType.itemName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :md="8" :sm="24">
              <a-form-item label="所属业务伙伴" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                <a-input placeholder="请输入所属业务伙伴" v-model="criteria.partnerId"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="所属组织" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                <a-input placeholder="请输入所属组织" v-model="criteria.orgCode"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                <a-select placeholder="请选择" v-model="criteria.status">
                  <a-select-option :value="userStatus.itemCode" v-for="(userStatus, index) in userStatusList" :key="index">{{userStatus.itemName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="手机号" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                <a-input placeholder="请输入手机号" v-model="criteria.mp"/>
              </a-form-item>
            </a-col>
          </a-row>

        </div>
        <span style="float: right; margin-top: 3px;">
          <a-button type="primary" @click="reloadTable(1)">查询</a-button>
          <a-button style="margin-left: 8px">重置</a-button>
        </span>
      </a-form>
    </div>
    <div>
      <div class="operator">
        <user-add ref="userAddModal" @addOkCallback="this.addOkCallback"></user-add>
        <a-button type='primary' @click="openUserAddModal()">新建用户</a-button>
        <user-update-modal ref="userUpdateModal" @updateCallback="this.updateOkCallback" ></user-update-modal>
        <user-role-and-group ref="userRoleAndGroup"></user-role-and-group>
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
        :scroll="{ x: 2000}"
      >
        <span slot="action" slot-scope="text, record">
          <a href="javascript:;" @click="openUpdateUser(record)">修改</a>
          <a-divider type="vertical" />
          <a href="javascript:;" @click="showUserRoleAndGroup(record)">查看用户组和角色</a>
        </span>
      </a-table>



    </div>
  </a-card>
</template>

<script>
import StandardTable from "../../components/table/StandardTable";
import { request } from "../../utils/RestClient";

import UserAdd from "./UserAdd";
import UserUpdateModal from "./UserUpdateModal";
import {fetchUserListPageData} from "./UserService";
import * as sysCodeService from "../syscode/SysCodeService";
import {copyReqObj} from "../../utils/common_util";
import userRoleAndGroup from "./userRoleAndGroup";

// console.log(request); ref="userUpdateModal"

const columns = [

  {
    title: "用户登录名",
    dataIndex: "loginName",
    width: 160
  },
  {
    title: "中文名",
    dataIndex: "userName",
    width: 120
  },
  {
    title: "用户类型",
    dataIndex: "userTypeTxt",
    sorter: true
    ,width: 120
  },
  {
    title: "所属业务伙伴",
    dataIndex: "partnerId"
    ,width: 160
  },
  {
    title: "所属组织",
    dataIndex: "orgCode"
    ,width: 120
  },
  {
    title: "手机号",
    dataIndex: "mp"
    ,width: 120
  },
  {
    title: "状态",
    dataIndex: "statusTxt"
    ,width: 120
  },
  {
    title: "创建时间",
    dataIndex: "createAt"
    ,width: 200
  },
  {
    title: "创建人",
    dataIndex: "createBy"
    ,width: 120
  },
  {
    title: "修改时间",
    dataIndex: "lastModifiedAt"
    ,width: 200
  },
  {
    title: "修改人",
    dataIndex: "lastModifiedBy"
    ,width: 120
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    scopedSlots: { customRender: 'action' }
    ,width: 120
  }
];

const dataSource = [];

export default {
  name: "UserList2",
  components: {
    StandardTable, UserAdd, UserUpdateModal, userRoleAndGroup
  },
  data() {
    return {
      //searchUserName: null,
      advanced: true,
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
      userTypeList:[],
      userStatusList:[],
      criteria: {}
      /*userName: null,
      loginName: null,
      userType: null,
      partnerId: null,
      orgCode: null,
      status: null,
      mp: null*/
    };
  },

  mounted() {
    console.log("mounted");
    this.reloadTable();
    //this.updateOkCallback.bind(this);
    this.loadDropDownList();
  },
  computed: {
    rowSelection() {
      // const { selectedRowKeys } = this;
      let self = this;
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          self.selectedUserIds = selectedRows.map(x => x.id);
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows, ", self.selectedUserIds is ", self.selectedUserIds);
        },
        getCheckboxProps: record => ({
          props: {
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
          }
        }),
      }
    }
  },
  methods: {
    toggleAdvanced() {
      this.advanced = !this.advanced;
    },
    //点击新建用户添加层
    openUserAddModal(){
      //debugger;
      this.$refs.userAddModal.showModal();
    },

    handleTableChange(pagination, filters, sorter) {
      // debugger
      console.log(pagination);
      const pager = { ...this.pagination };
      pager.current = pagination.current;
      pager.sortColumn = sorter.field;
      pager.sort = sorter.order == 'descend' ? 2 : 1;

      this.pagination = pager;

      this.reloadTable();
    },
    remove() {
      this.dataSource = this.dataSource.filter(
        item => this.selectedRowKeys.indexOf(item.key) < 0
      );
      this.selectedRows = this.selectedRows.filter(
        item => this.selectedRowKeys.indexOf(item.key) < 0
      );
    },
    addNew() {

    },
    openUpdateUser(user) {
      this.$refs.userUpdateModal.showModal(user);
    },
    updateOkCallback() {
      this.reloadTable(1)
    },
    addOkCallback() {
      this.reloadTable(1)
    },
    deleteUser() {
      let self = this;
      let userIds = [...self.selectedUserIds];
      let size = userIds ? userIds.length : 0;
      if (!size || size == 0) {
        this.$message.info("请选中需要删除的用户");
        return;
      }

      self.loading = true;
      request("/dolphin/api/v1/app-user/delete", {
        method: "POST",
        data: {userIds: userIds}
      })
      .then(res => {
        self.loading = false;

        if (res.status === 0) {
          this.$message.success("删除用户成功");
          self.reloadTable(1);
        } else {
          this.$message.error("删除用户错误");
        }
      })
      .catch(err => {
        this.$message.error("删除用户错误");
        self.loading = false;
        console.log(`err is ${err}`);
      });

    },

    handleMenuClick(e) {
      if (e.key === "delete") {
        this.remove();
      }
    },

    reloadTable(pageNo) {
      //console.log("reloadTable triggered ", this.searchUserName, ", ", this.pagination);
      //console.log("reloadTable triggered ", this.criteria, ", ", this.pagination);
      let self = this;
      let p = self.pagination;
      let currentPageNo = pageNo ? pageNo : p.current;
      let criteria = {};
      //console.log(self.criteria.userName);
      criteria = copyReqObj(self.criteria);

      console.log("reloadTable triggered ", this.criteria, ", ", this.pagination);
      let pageReq = {
        pagination: {totalSize: p.total, pageSize: p.pageSize, pageNo: currentPageNo},
        criteria
      };
      self.selectedRowKeys = [];

      fetchUserListPageData(pageReq)
      .then(res => {
        self.loading = false;

        if (res.status === 0) {
          let ret = res.data;
          self.dataSource = ret.rows;
          let pag = ret.pagination;
          self.pagination = {total: pag.totalSize, pageSize: pag.pageSize, current: pag.pageNo};
        } else {
          this.$message.error("获取数据错误2");
        }
      })
      .catch(err => {
        self.loading = false;
        this.$message.error("获取数据错误2");
        console.log(`err is ${err}`);
      });

    },
    loadDropDownList(){
      sysCodeService.findSysUserTypes()
        .then(
          resp => {
            if (resp.status === 0) {
              this.userTypeList = resp.data;
            } else {
              this.userTypeList = [];
            }
          }
        )
        .catch(err => {
          console.log(`err is ${err}`);
        });

      sysCodeService.findSysUserStatus()
        .then(resp => {
          if (resp.status === 0) {
            this.userStatusList = resp.data;
          } else {
            this.userStatusList = [];
          }
        }).catch(err => {
        console.log(`err is ${err}`);
      });

    },
    showUserRoleAndGroup(record){
        this.$refs.userRoleAndGroup.showDrawer(record.id);
    }




  }
};
</script>

<style lang="less" scoped>
.search {
  margin-bottom: 54px;
}

.fold {
  width: calc(100% - 216px);
  display: inline-block;
}

.operator {
  margin-bottom: 18px;
}

@media screen and (max-width: 900px) {
  .fold {
    width: 100%;
  }
}
</style>
