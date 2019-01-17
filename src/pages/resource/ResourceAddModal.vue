<script>
import { Form } from 'ant-design-vue'
import { request } from "../../utils/RestClient";
import moment from 'moment';
import * as resourceService from "./ResourceService";
import {getItemsBytypeCode} from "../syscode/SysCodeService";


const CollectionCreateForm = Form.create()(
  {
    props: ['visible','resNodeTypes'],
    render () {
      const { visible,resNodeTypes, form } = this
      const { getFieldDecorator } = form
      console.log('RoleAdd CollectionCreateForm in, visible is ', visible)
      return (
        <a-modal
          visible={visible}
          title='新增新资源'
          okText='创建'
          onCancel={() => { this.$emit('cancel') }}
          onOk={() => { this.$emit('create') }}
        >
          <a-form layout='vertical'>
            <a-form-item label='资源编码'>
              {getFieldDecorator('resCode', {
                rules: [{ required: true, message: '请输入资源编码' }],
              })(
                <a-input />
              )}
            </a-form-item>

            <a-form-item label='资源名称'>
              {getFieldDecorator('resName', {
                rules: [{ required: true, message: '请输入资源名称' }],
              })(
                <a-input />
              )}
            </a-form-item>
            <a-form-item label='资源节点类型'>
              {getFieldDecorator('resNodeType', {
                rules: [{ required: true, message: '请选择资源节点类型' }],
              })(
                    <a-select  >
                    {
                      resNodeTypes && resNodeTypes.map((item) =>{ 
                        return <a-select-option value={item.itemCode} key={item.itemCode}>{item.itemName}</a-select-option>;
                      })
                   }
                 </a-select>
              )}
            </a-form-item>
            <a-form-item label='资源路径'>
              {getFieldDecorator('url', {
                rules: [{ required: false, message: '请输入资源路径' }],
              })(
                <a-input />
              )}
            </a-form-item>

            <a-form-item label='资源备注'>
              {getFieldDecorator('resMemo', {
                rules: [{ required: false, message: '请输入资源备注' }],
              })(
                <a-input />
              )}
            </a-form-item>
            
          </a-form>
        </a-modal>
      )
    },
  }
)

export default {
  name: "ResourceAddModal",
  props: ['addOkCallback'],
  data () {
    return {
      visible: false,
      sys_code:"RES_NODE_TYPE",
      resNodeTypes:[],
      resParentCode:"", //当前所选择的所属系统
    }
  },
  mounted() {
    console.log("resource Add mounted");
  },
  methods: {
     showModal (resParentCode) {
      this.queryResNodeType()
      this.resParentCode = resParentCode
      this.visible = true
    },
    handleCancel  () {
      this.visible = false
    },
    queryResNodeType(){
         getItemsBytypeCode(this.sys_code)
        .then(res => {
          self.loading = false;
          if (res.status === 0) {
            this.resNodeTypes = res.data;
          } else {
            this.$message.error("获取资源接点类型错误") 
          }
        })
        .catch(err => {
          this.$message.error("获取资源接点类型错误") 
          console.log(`err is ${err}`) 
        });
    },
    handleCreate  () {
      const form = this.formRef.form
      form.validateFields((err, values) => {
        if (err) {
          return
        }
        console.log('Received values of form: ', values)
        let row = {
          resCode:values.resCode,
          resName: values.resName,
          resNodeType:values.resNodeType,
          url:values.url,
          resMemo : values.resMemo,
          resParentCode: this.resParentCode,
        }
        let self = this;
        resourceService.addResource(row)
        .then(res => {
          self.loading = false;
          if (res.status === 0) {
            this.$message.success("创建资源成功");
            self.visible = false
            form.resetFields()
             if (self.addOkCallback && typeof self.addOkCallback === 'function') {
              self.addOkCallback()
            }
          } else {
            this.$message.error("创建资源错误");
          }
        })
        .catch(err => {
          self.loading = false;
          this.$message.error("创建资源错误");
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
          resNodeTypes={this.resNodeTypes}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </span>
    )
  },
}
</script>
