<template>
  <a-card>
    <div :class="advanced ? 'search' : null">
       <a-form layout="horizontal">
        <div :class="advanced ? null: 'fold'">
          
        </div>
        <span style="float: right; margin-top: 3px;">
          <a-button type="primary"  @click="reloadTable(1)">查询</a-button>
          <a-button style="margin-left: 8px">重置</a-button>
        </span>
      </a-form>
    </div>

    <div>
      <div class="operator">
         <sys-type-add-modal ref="sysTypeAddModal" :addOkCallback="addOkCallback"></sys-type-add-modal> 
         <sys-item-manage-modal ref="sysItemManageModal" :addOkCallback="addOkCallback"></sys-item-manage-modal> 
         <a-button type='primary' icon="file-add" @click="openSysTypeAddModal()">新建码表类型</a-button>
         <a-button type='primary' @click="openSysItemManageModal()">字典代码维护</a-button>
         <a-button icon="delete">删除</a-button>  
      </div>  

      <a-table
        :columns="columns"
        :rowKey="record => record.typeCode"
        :dataSource="dataSource"
        :pagination="pagination"
        :selectedRows="selectedRows"
        :loading="loading"
        @change="handleTableChange"
        :rowSelection="rowSelection"
      >
        <!-- <span slot="action" slot-scope="text, record">
          <a href="javascript:;" @click="openUpdateRole(record.typeCode)">更新{{record.typeCode}}</a>
          <a-divider type="vertical" />
        </span>  -->
      </a-table>
    </div>


  </a-card>
</template>

<script>
import StandardTable from "../../components/table/StandardTable";
import { request } from "../../utils/RestClient";
import {fetchPageData} from "./SysCodeService"
import SysTypeAddModal from "./SysTypeAddModal"
import SysItemManageModal from "./SysItemManageModal"

const columns = [
   {
    title: "类型编码"
    ,dataIndex:"typeCode"
    , width: 150
  },
  {
    title: "类型名称"
    ,dataIndex:"typeName"
    , width: 150
  },
  {
    title: "是否树状结构"
    ,dataIndex:"isTree"
    , width: 150
  },
  {
    title: "维护方式"
    ,dataIndex:"maintainType"
    , width: 150
  },
];

const dataSource = [];

export default {
  name: "SysCodeList",
  components: {
    StandardTable,SysTypeAddModal,SysItemManageModal
  },
  data() {
    return {
      advanced: true,
      columns: columns,
      dataSource: dataSource,
      selectedRowKeys: [],
      selectedRows: [],
      selectedRoleIds: [],
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
  },
  computed: {
   rowSelection() {
      let self = this;
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          self.selectedTypeCodes = selectedRows.map(x => x.id);
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows, ", self.selectedTypeCodes is ", self.selectedTypeCodes);
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
    openSysTypeAddModal(){
      this.$refs.sysTypeAddModal.showModal();
    },
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination);
      const pager = { ...this.pagination };
      pager.current = pagination.current;
      pager.sortColumn = sorter.field;
      pager.sort = sorter.order == 'descend' ? 2 : 1;
      this.pagination = pager;
      this.reloadTable();
    },
    
    reloadTable(pageNo) {
      let self = this;
      let p = self.pagination;
      let currentPageNo = pageNo ? pageNo : p.current;
      let criteria = {};
      let pageReq = {
        pagination: {totalSize: p.total, pageSize: p.pageSize, pageNo: currentPageNo},
        criteria
      };
      self.selectedRowKeys = [];
      console.log(JSON.stringify(pageReq));
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

@media screen and (max-width: 900px) {
  .fold {
    width: 100%;
  }
}
</style>
