<template>
<div>
  
  <a-modal
      width="80%"
      title='增加用户'
      okText='增加'
      cancelText='取消'
     :visible="visible"
      @ok="() =>handleConfirm()"
      @cancel="() => handleCancel()"
    >
          <a-card>
            
            <a-form layout="horizontal">
                <a-row>
                 <a-col :md="8" :sm="24">
                  <a-form-item label="角色名称" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                      <a-input v-model="searchInput" placeholder="输入角色名称模糊搜索"   />
                  </a-form-item>
                  </a-col>
                </a-row>

                <a-row>
                  <a-button type="primary" key="query" @click="query">查询</a-button>
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
 import StandardTable from "../../components/table/StandardTable";
 import { findRolePagingNoAssign }  from "../role/RoleService";
 import { assignRolesToResource }  from "./RoleResourceService";

 const columns = [
  {
    title: "ID",
    dataIndex: "id",
    sorter: true
  },
  {
    title: "角色编号",
    dataIndex: "roleCode"
  },
  {
    title: "角色名",
    dataIndex: "roleName",
    sorter: true
  },
   {
    title: "所属系统",
    dataIndex: "systemId",
    sorter: true
  },
  {
    title: "分配时间",
    dataIndex: "lastModifiedAt",
    sorter: true
  },
  {
    title: "分配人",
    dataIndex: "lastModifiedBy"
  }
   
];

export default {
  name: "ResourceRoleModal",
  props: ['assignOkCallback'],
  data () {
    return {
      visible: false,
      columns: columns,
      dataSource: [],
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
      resourceId:undefined,
      searchInput:"",
     
    }
  },
  mounted() {
    console.log("user role  modal mounted");
  },
   computed: {
    rowSelection() {
      let self = this;
      return {
        onChange: (selectedRowKeys, selectedRows) => {

          self.selectedRoleIds = selectedRows.map(x => x.id);
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows, ", self.selectedRoleIds is ", self.selectedRoleIds);
        },
        
      }
    },
  },
  destroyed() {
    console.log("resource role  modal destroyed");
  },
  beforeUpdate() {
    console.log("resource role  modal beforeUpdate");
  },
  methods: {
    showModal (resourceId) {
      this.visible = true
      this.resourceId=resourceId
      this.loadRole(1);
    },
    query(){
      this.loadRole(1)
    },
    loadRole (pageNo) {
      let self = this;
      let p = self.pagination;
      let currentPageNo = pageNo ? pageNo : p.current;
      let criteria = {};
      if(this.resourceId){
        criteria.resourceId = this.resourceId;
      }
      if(this.searchInput){
          criteria.roleName = this.searchInput;
      }
      let pageReq = {
        pagination: {totalSize: p.total, pageSize: p.pageSize, pageNo: currentPageNo},
         criteria
      };
      self.selectedRowKeys = [];
      console.log("query resource role param  is : \n"+JSON.stringify(pageReq));
      self.loading= true
     findRolePagingNoAssign(pageReq)
      .then(res => {
        self.loading = false;
        if (res.status === 0) {
          let ret = res.data;
          self.dataSource = ret.rows;
          let pag = ret.pagination;
          self.pagination = {total: pag.totalSize, pageSize: pag.pageSize, current: pag.pageNo};
        } else {
          this.$message.error("获取未分配该资源的角色数据错误");
        }
      })
      .catch(err => {
        self.loading = false;
        this.$message.error("获取未分配该资源的角色数据错误");
        console.log(`err is ${err}`);
      });
    },
    handleCancel  () {
      this.visible = false
      this.resourceId = undefined
    },
    handleConfirm  () { 
        let self = this;
        let roleIds = [...self.selectedRoleIds];
        let size = roleIds ? roleIds.length : 0;
        if (!size || size == 0) {
          this.$message.info("请选中需要分配的角色");
          return;
        }
        self.loading = true;
        assignRolesToResource(this.resourceId,roleIds)
          .then(res => {
            self.loading = false;
            if (res.status === 0) {
               if (self.assignOkCallback && typeof self.assignOkCallback === 'function') {
                  self.visible = false;
                  self.assignOkCallback();
               }
               this.$message.success("添加角色成功");
            } else {
              this.$message.error("添加角色错误");
            }
          })
          .catch(err => {
            self.loading = false;
            this.$message.error("添加角色错误");
            self.loading = false;
            console.log(`err is ${err}`);
          });
       
        
    },
  },
}
</script>
