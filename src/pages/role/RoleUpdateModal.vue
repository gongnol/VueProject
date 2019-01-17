<script>
import { Form } from 'ant-design-vue'
import { request } from "../../utils/RestClient";
import moment from 'moment';

import * as roleService from "./RoleService";
import * as sysCodervice from "../syscode/SysCodeService";


const UserUpdateForm = Form.create()(
  {
    props: ['visible','sub_systems'],
    render () {
      const { visible, form,sub_systems} = this
      const { getFieldDecorator } = form
      return (
        <a-modal
          visible={visible}
          title='更新角色'
          okText='更新'
          cancelText='取消'
          onCancel={() => { this.$emit('cancel') }}
          onOk={() => { this.$emit('create') }}
        >

          <a-form layout='vertical'>
            <a-form-item label='角色编码'>
              {getFieldDecorator('roleCode',{
                rules: [{ required: true, message: '请输入角色编码' }],
              })(
                <a-input/>
              )}
            </a-form-item>
            <a-form-item label='角色名称'>
              {getFieldDecorator('roleName', {
                rules: [{ required: true, message: '请输入角色名称' }],
              })(
                <a-input />
              )}
            </a-form-item>

            <a-form-item label='所属系统'>
                {getFieldDecorator('systemId', {
                  rules: [{ required: true, message: '请输入所属系统' }],
                })(
                      <a-select  >
                      {
                        sub_systems && sub_systems.map((item) =>{ 
                          return <a-select-option value={item.itemCode} key={item.itemCode}>{item.itemName}</a-select-option>;
                        })
                     }
                   </a-select>
                )}
              </a-form-item>

          </a-form>

        </a-modal>
      )
    },
  }
)

export default {
  name: "RoleUpdateModal",
  props: ['updateOkCallback'],
  data () {
    return {
      visible: false,
      roleId:undefined,
      roleRecord: {},
      sub_systems:[],     //    
      systemId:"",  
    }
  },
  mounted() {
    console.log("update modal mounted");
  },
  destroyed() {
    console.log("update modal destroyed");
  },
  methods: {
    showModal (roleId,sub_systems) {
      this.visible = true
      this.roleId = roleId
      this.sub_systems = sub_systems
       this.loadUser(this.roleId);
    },
    loadUser (roleId) {
      if (!roleId) {
        return
      }
      const form = this.formRef.form
      roleService.getRoleById(roleId)
      .then(res => {
        if (res.status === 0) {
          let ret = res.data;
          let row = {
            roleCode: ret.roleCode,
            roleName: ret.roleName,
            systemId: ret.systemId,
          }
          form.setFieldsValue({...row})
        } else {
          this.$message.error("获取角色数据错误");
        }
      })
      .catch(err => {
        this.$message.error("获取角色数据错误");
        console.log(`err is ${err}`);
      });

    },
    handleCancel  () {
      this.visible = false
      this.roleId = undefined
      this.roleCode = undefined
    },
    handleConfirm  () {
      let self = this;
      const form = this.formRef.form
      form.validateFields((err, values) => {
        if (err) {
          return
        }
        console.log('Received update values of form: ', values)

        let row = {...values, id:self.roleId};
        console.log(row);
        roleService.updateRole(row)
        .then(res => {
          if (res.status === 0) {
            this.$message.success("更新角色信息成功")
            self.userId = undefined
            if (self.updateOkCallback && typeof self.updateOkCallback === 'function') {
              self.updateOkCallback()
            }
            self.visible = false
          } else {
            this.$message.error("更新角色信息错误");
          }
        })
        .catch(err => {
          self.loading = false;
          this.$message.error("更新角色信息错误");
          console.log(`err is ${err}`);
        });

        form.resetFields()

      })
    },
    saveFormRef  (formRef) {
      this.formRef = formRef
    },
  },

  render () {
    return (
      <span>
        <UserUpdateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.visible}
          sub_systems={this.sub_systems}
          onCancel={this.handleCancel}
          onCreate={this.handleConfirm}
        />
      </span>
    )
  },
}
</script>
