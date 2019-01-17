<template>
  <a-card>
    <div :class="advanced ? 'search' : null">
      <a-form layout="horizontal">
        <div :class="advanced ? null: 'fold'">
          <a-row>
            <a-col :md="8" :sm="24">
              <a-form-item label="用户名TX" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                <a-input placeholder="请输入TestTX" v-model="searchUserName"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="是否删除" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                <a-select placeholder="请选择">
                  <a-select-option value="0">未删除test</a-select-option>
                  <a-select-option value="1">已删除stst</a-select-option>
                </a-select>
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
        <user-add></user-add>
        <user-update-modal ref="userUpdateModal" :updateOkCallback="updateOkCallback"></user-update-modal>
        <a-button @click="deleteUser" >删除</a-button>
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
        <span slot="action" slot-scope="text, record">
          <a href="javascript:;" @click="openUpdateUser(record.id)">更新{{record.id}}</a>
          <a-divider type="vertical" />
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
import {fetchPageData} from "./UserService"

// console.log(request); ref="userUpdateModal"

const columns = [
  {
    title: "ID",
    dataIndex: "id"
  },
  {
    title: "用户名",
    dataIndex: "username"
  },
  {
    title: "生日",
    dataIndex: "birth"
  },
  {
    title: "年龄",
    dataIndex: "age",
    sorter: true
  },
  {
    title: "更新时间xxxx",
    dataIndex: "updateTime"
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  }
];

const dataSource = [];

export default {
  name: "UserList",
  components: {
    StandardTable, UserAdd, UserUpdateModal
  },
  data() {
    return {
      searchUserName: null,
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
      }
    };
  },

  mounted() {
    console.log("mounted");
    this.reloadTable();
    this.updateOkCallback.bind(this)
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
    openUpdateUser(userId) {
      this.$refs.userUpdateModal.showModal(userId);
    },
    updateOkCallback() {
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
      console.log("reloadTable triggered ", this.searchUserName, ", ", this.pagination);
      let self = this;
      let p = self.pagination;
      let currentPageNo = pageNo ? pageNo : p.current;
      let criteria = {};
      if (this.searchUserName) {
        criteria.username = this.searchUserName;
      }
      let pageReq = {
        pagination: {totalSize: p.total, pageSize: p.pageSize, pageNo: currentPageNo},
        criteria
      };
      self.selectedRowKeys = [];

      fetchPageData(pageReq)
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
