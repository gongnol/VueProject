<script>
import { Form } from 'ant-design-vue'
import { request } from "../../utils/RestClient";
import moment from 'moment';
import * as resourceService from "./ResourceService";

const CollectionCreateForm = Form.create()(
  {
    props: ['visible'],
    render () {
      const { visible, form } = this
      const { getFieldDecorator } = form
      console.log('RoleAdd CollectionCreateForm in, visible is ', visible)
      return (
        <a-modal
          visible={visible}
          title='修改资源'
          okText='修改'
          onCancel={() => { this.$emit('cancel') }}
          onOk={() => { this.$emit('create') }}
        >
          <a-form layout='vertical'>
           
            <a-form-item label='资源名称'>
              {getFieldDecorator('resName', {
                rules: [{ required: true, message: '请输入资源名称' }],
              })(
                <a-input />
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
  props: ['updateOkCallback'],
  data () {
    return {
      visible: false,
      loading:false,
      resourceId: undefined, //当前所选择的所属系统
    }
  },
  mounted() {
    console.log("resource Add mounted");
  },
  methods: {
     showModal (resourceId) {
      this.visible = true;
      this.resourceId = resourceId;
      this.loadResource();
    },
    loadResource () {
      if (!this.resourceId) {
        return
      }
      this.loading = true;
      const form = this.formRef.form
      resourceService.getResourceById(this.resourceId)
      .then(res => {
        this.loading = false;
        if (res.status === 0) {
          let ret = res.data;
          let row = {

            resName : ret.resName,
            url     : ret.url,
            resMemo : ret.resMemo,
          }
          form.setFieldsValue({...row})
        } else {
          this.$message.error("获取资源数据错误");
        }
      })
      .catch(err => {
        this.loading = false;
        this.$message.error("获取资源数据错误");
        console.log(`err is ${err}`);
      });

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
          id      : this.resourceId,
          resName: values.resName,
          url:values.url,
          resMemo : values.resMemo,
        }
        let self = this;
        self.loading = true;
        resourceService.updateResource(row)
        .then(res => {
          self.loading = false;
          if (res.status === 0) {
            this.$message.success("修改资源成功");
            self.visible = false
            form.resetFields()
             if (self.updateOkCallback && typeof self.updateOkCallback === 'function') {
               self.updateOkCallback()
             }
          } else {
            this.$message.error("修改资源错误");
          }
        })
        .catch(err => {
          self.loading = false;
          this.$message.error("修改资源错误");
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
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </span>
    )
  },
}
</script>
