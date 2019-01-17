<template>
  <a-card>
    <div :class="advanced ? 'search' : null">
       <a-form layout="horizontal">
        <div :class="advanced ? null: 'fold'">
           <a-row>
            <a-col :md="8" :sm="24">
              <a-form-item label="所属系统" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
               <a-select 
                  showSearch 
                  placeholder="请选择"
                  :filterOption="filterOption"  
                  v-model="systemId" >
                  <a-select-option v-for="option in sub_systems" :key="option.itemCode"
                   :value="option.itemCode">{{option.itemName}} </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </div>
        <a-row style="float: right; margin-top: 3px;">
          <a-button type="primary"  @click="reloadTable(1)">查询</a-button>
          <a-button style="margin-left: 8px" @click="reset()">重置</a-button>
        </a-row>
      </a-form>
    </div>

    <div>
      <div class="operator">
        <role-add-modal  ref="roleAddModal"  :addOkCallback="addOkCallback"></role-add-modal>
        <role-update-modal ref="roleUpdateModal" :updateOkCallback="updateOkCallback"></role-update-modal>
         <a-button type='primary' @click="openAddRole()">新建角色</a-button>
        <a-button @click="deleteRole" >删除</a-button>  
      </div>  
      <div>
        <a-row>
          <a-table
            :columns="columns"
            :rowKey="record => record.id"
            :dataSource="dataSource"
            :pagination="pagination"
            :selectedRows="selectedRows"
            :loading="loading"
            @change="handleTableChange"
            :rowSelection="rowSelection"
            :scroll="{ x: 1500}">
               <span slot="action" slot-scope="text, record">
                  <a href="javascript:;" @click="openUpdateRole(record.id)">更新</a>
                   <a-divider type="vertical" />
                   <a href="javascript:;"  @click="showUserAndResource(record.id,record.roleName)" >查看用户和资源</a>
                </span> 
           </a-table>
        </a-row>
        <a-row>
            <div  v-show="showTabs"  class="primary" >当前角色：{{roleName}}</div>
            <div>
                <a-tabs defaultActiveKey="1"  v-show="showTabs" @change="callback">
                    <a-tab-pane tab="已分配用户" key="1">
                          <user-role-list ref="userRoleList"></user-role-list>
                    </a-tab-pane>
                    <a-tab-pane tab="已关联资源" key="2" forceRender>
                        <role-resource-list ref="roleResourceList"></role-resource-list> 
                    </a-tab-pane>
                  </a-tabs>
             </div>
         </a-row>
      </div>
    </div>
  </a-card>
</template>

<script>
import StandardTable from "../../components/table/StandardTable";
import UserRoleList from "../userrole/UserRoleList";
import RoleResourceList from "../roleresource/RoleResourceList"

import { request } from "../../utils/RestClient";
import {fetchPageData,deleteRole} from "./RoleService";
import {getItemsBytypeCode} from "../syscode/SysCodeService";
import RoleAddModal from "./RoleAddModal";
import RoleUpdateModal from "./RoleUpdateModal";


const columns = [
  {
    title: "ID"
    ,dataIndex:"id"
    ,fixed: 'left' 
    ,sorter: true
    , width: 150
  },
  {
    title: "角色编号"
    ,dataIndex: "roleCode"
    , width: 150
  },
  {
    title: "角色名"
    ,dataIndex: "roleName"
    ,sorter: true
    , width: 150
  },
   {
    title: "所属系统"
    ,dataIndex: "systemId"
    ,sorter: true
    , width: 150
  },
  {
    title: "创建时间"
   ,dataIndex: "createAt"
    ,sorter: true
    , width: 200
  },
  {
    title: "最后更新时间"
    ,dataIndex: "lastModifiedAt"
    ,sorter: true
    , width: 200
  },
   {
    title: "创建人"
    ,dataIndex: "createAtBy"
    , width: 150
  },
  {
    title: "最后更新人"
    ,dataIndex: "lastModifiedAtBy"
    , width: 150
  },
  {
    title: '操作' 
    ,key: 'action' 
    ,fixed: 'right'
    , width: 200
    ,scopedSlots: { customRender: 'action' }
  }
];

const dataSource = [];
const sub_systems = [];

export default {
  name: "RoleList",
  components: {
    StandardTable, RoleAddModal,RoleUpdateModal,UserRoleList,RoleResourceList
  },
  data() {
    return {
      showTabs:false,
      advanced: true,
      columns: columns,
      sys_code:"SYSTEM_IDS",
      systemId:"",
      sub_systems:sub_systems,
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
      },
      roleName:"",
    };
  },
  mounted() {
    console.log("mounted");
    this.getSelectSystems();
    this.reloadTable(1);
    this.updateOkCallback.bind(this)
  },
  computed: {
   rowSelection() {
      let self = this;
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          self.selectedRoleIds = selectedRows.map(x => x.id);
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows, ", self.selectedRoleIds is ", self.selectedRoleIds);
        },
        getCheckboxProps: record => ({
          props: {
            disabled: record.name === 'Disabled Role', // Column configuration not to be checked
            name: record.name,
          }
        }),
      }
    },
  },
  methods: {
    toggleAdvanced() {
      this.advanced = !this.advanced;
    },
    handleTableChange(pagination, filters, sorter) {
      console.log("handleTableChange =="+JSON.stringify(pagination)+"\n filters is "+JSON.stringify(filters)+"sorter is"+JSON.stringify(sorter));
      const pager = { ...this.pagination };
      pager.current = pagination.current;
      pager.sortColumn = sorter.field;
      pager.sort = sorter.order == 'descend' ? 2 : 1;
      this.pagination = pager;
      console.log("after is "+JSON.stringify( this.pagination));
      this.reloadTable(1);
    },
    reset(){
        this.systemId = "";
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    getSelectSystems(){
        getItemsBytypeCode(this.sys_code)
        .then(res => {
          self.loading = false;
          if (res.status === 0) {
            this.sub_systems = res.data;
          } else {
            this.$message.error("获取所属系统码表错误");
          }
        })
        .catch(err => {
          this.$message.error("获取所属系统码表错误");
          console.log(`err is ${err}`);
        });
    },
    //点击查看用户和资源
    showUserAndResource(roleId,roleName){
        this.showTabs = true;
        this.roleName = roleName;
        this.$refs.userRoleList.showData(roleId);
        this.$refs.roleResourceList.showData(roleId,roleName);

    },
    openUserResourceModal(){
          this.$refs.userResourceModal.showModal();
    },
    //点击添加按钮 弹出添加层
    openAddRole(){
        this.$refs.roleAddModal.showModal(this.sub_systems);
    },
    //点击更新按钮，将roleCode传到model
    openUpdateRole(roleId) {
      this.$refs.roleUpdateModal.showModal(roleId,this.sub_systems);
    },
    //更新角色成功后 的反馈
    updateOkCallback() {
      this.reloadTable(1);
    },
    //添加角色成功后
    addOkCallback(){
      this.reloadTable(1);
    },
    //删除角色
    deleteRole(){
      let self = this;
      let roleIds = [...self.selectedRoleIds];
      let size = roleIds ? roleIds.length : 0;
      if (!size || size == 0) {
        this.$message.info("请选中需要删除的角色");
        return;
      }
      self.loading = true;
      this.$confirm({
        title: '删除资源',
        content: '确定删除该资源吗？',
        onOk() {
              deleteRole(roleIds)
              .then(res => {
                self.loading = false;
                if (res.status === 0) {
                   self.reloadTable(1)
                   self.$message.success("删除角色成功");
                } else {
                  self.$message.error("删除角色错误");
                }
              })
              .catch(err => {
                self.$message.error("删除角色错误");
                self.loading = false;
                console.log(`err is ${err}`);
              });
        },
        onCancel() {},
      });
    },
    reloadTable(pageNo) {
      let self = this;
      self.showTabs = false;
      let p = self.pagination;
      let currentPageNo = pageNo ? pageNo : p.current;
      let criteria = {};
      if(this.systemId){
        criteria.systemId = this.systemId;
      }
      let pageReq = {
        pagination: {totalSize: p.total, pageSize: p.pageSize, pageNo: currentPageNo,sortColumn:p.sortColumn,sort:p.sort},
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
          self.$message.error("获取数据错误");
        }
      })
      .catch(err => {
        self.loading = false;
        self.$message.error("获取数据错误");
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
