<template>
    <a-card>
      <a-form layout="horizontal">
        <div>
            <div class="operator">
             <resource-role-modal  ref="resourceRoleAddModal"  :assignOkCallback="assignOkCallback"></resource-role-modal>
               <a-button type='primary' @click="openResourceRoleModal" >增加角色</a-button>
              <a-button  @click="deleteRole">删除</a-button>  
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
              <a href="javascript:;" @click="deleteRole(record.id)">删除</a>
              <a-divider type="vertical" />
            </span> 

            </a-table>
          </div>
      </a-form>
    </a-card>
</template>

<script>
import StandardTable from "../../components/table/StandardTable";
import { queryRolesByResourceId }  from "../role/RoleService";
import ResourceRoleModal from "./ResourceRoleAddModal"
import * as roleResourceService from "./RoleResourceService";

const columns = [
  {
    title: "角色编码",
    dataIndex: "roleCode"
  },
  {
    title: "角色名称",
    dataIndex: "roleName"
  },
   {
    title: "系统名称",
    dataIndex: "systemId"
  },
  {
    title: "分配时间",
    dataIndex: "lastModifiedAt"
  },
   {
    title: "分配人",
    dataIndex: "lastModifiedBy"
  }
]


export default {
  name: "ResourceRoleList",
  components: {
    StandardTable,ResourceRoleModal
  },
  data() {
    return{ 
      columns: columns,
      dataSource: [],
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
      resourceId:undefined,
    }
  },
  mounted() {
    console.log("  role resource mounted");
  },
  computed: {
   rowSelection() {
      let self = this;
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          self.selectedRoleIds = selectedRows.map(x => x.id);
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows, ", self.selectedUserIds is ", self.selectedRoleIds);
        },
        
      }
    },
  },
methods: {
    showData (resourceId) {
        console.log("resourceId is " + resourceId) 
        this.resourceId = resourceId
        this.reloadTable(1) 
    },
    //点击打开增加弹出框
    openResourceRoleModal(){
        this.$refs.resourceRoleAddModal.showModal(this.resourceId)
    },
    assignOkCallback(){
      this.reloadTable(1);
    },
    //选中用户 ，删除该角色下的用户关系
    deleteRole(){
       let self = this;
       let roleIds = [...self.selectedRoleIds];
      let size = roleIds ? roleIds.length : 0;
      if (!size || size == 0) {
        this.$message.info("请选中需要删除的角色");
        return;
      }
      self.loading = true;
      roleResourceService.deleteRolesByResId(this.resourceId,roleIds)
        .then(res => {
          self.loading = false;
          if (res.status === 0) {
             this.$message.success("删除角色成功");
          } else {
            this.$message.error("删除角色错误");
          }
           this.reloadTable(1)
        })
        .catch(err => {
          self.loading = false;
          this.$message.error("删除角色错误");
          self.loading = false;
          console.log(`err is ${err}`);
        });
    },
    //根据资源ID  获取该资源下的角色列表
    reloadTable(pageNo) {
      let self = this;
      let p = self.pagination;
      let currentPageNo = pageNo ? pageNo : p.current;
      let criteria = {};
      if(this.resourceId){
        criteria.resourceId = this.resourceId;
      }
      let pageReq = {
        pagination: {totalSize: p.total, pageSize: p.pageSize, pageNo: currentPageNo},
         criteria
      };
      self.selectedRowKeys = [];
      console.log("query user role param  is : \n"+JSON.stringify(pageReq));
       queryRolesByResourceId(pageReq)
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