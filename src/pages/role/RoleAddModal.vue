<script>
import { Form } from 'ant-design-vue'
import { request } from "../../utils/RestClient";
import moment from 'moment';
import * as roleService from "./RoleService";
import * as sysCodervice from "../syscode/SysCodeService";

const CollectionCreateForm = Form.create()(
  {
    props: ['visible','sub_systems'],
    render () {
      const { visible, form ,sub_systems} = this
      const { getFieldDecorator } = form
      console.log('RoleAdd CollectionCreateForm in, visible is ', visible)
      return (
        <a-modal
          visible={visible}
          title='新增新角色'
          okText='创建'
          cancelText='取消'
          onCancel={() => { this.$emit('cancel') }}
          onOk={() => { this.$emit('create') }}
        >
          <a-form layout='vertical'>
            <a-form-item label='角色Code'>
              {getFieldDecorator('roleCode', {
                rules: [{ required: true, message: '请输入角色编码' }],
              })(
                <a-input />
              )}
            </a-form-item>
            <a-form-item label='角色名'>
              {getFieldDecorator('roleName', {
                rules: [{ required: true, message: '请输入角色名' }],
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
  name: "RoleAdd",
  props: ['addOkCallback'],
  data () {
    return {
      visible: false,
      sys_code:"SYSTEM_IDS",
      selectSystem:"", //当前所选择的所属系统
      sub_systems:[],      //所属系统列表
    }
  },
  mounted() {
    console.log("RoleAdd mounted");
  },
  methods: {
     showModal (sub_systems) {
      this.visible = true;
      this.sub_systems = sub_systems;
    },
    handleCancel  () {
      this.visible = false
    },
    handleCreate  () {
      const form = this.formRef.form
      form.validateFields((err, values) => {
        if (err) {
          return
        }
        console.log('Received values of form: ', values)

        let row = {
          roleCode: values.roleCode,
          roleName: values.roleName,
          systemId:values.systemId,
        }

        let self = this;

        roleService.addRole(row)
        .then(res => {
          self.loading = false;
          if (res.status === 0) {
            this.$message.success("创建角色成功");
            self.visible = false
            form.resetFields()
             if (self.addOkCallback && typeof self.addOkCallback === 'function') {
              self.addOkCallback()
            }
          } else {
            this.$message.error("创建角色错误");
          }
        })
        .catch(err => {
          this.$message.error("创建角色错误");
          console.log(`err is ${err}`);
        });



      })
    },
    saveFormRef  (formRef) {
      this.formRef = formRef
    },
  },

  render () {
    console.log('RoleAdd in, this.visible is ', this.visible)

    return (

      <span>
       
        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.visible}
          sub_systems = {this.sub_systems}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </span>
    )
  },
}
</script>
