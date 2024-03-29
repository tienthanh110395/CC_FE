import groovy.json.JsonOutput
import groovy.util.XmlSlurper


@SuppressWarnings("GrMethodMayBeStatic")
@NonCPS
def parseXml(xmlString) {
    def xmlParser = new XmlSlurper()
    xmlParser.setFeature("http://apache.org/xml/features/disallow-doctype-decl", false)
    xmlParser.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false)
    return xmlParser.parseText(xmlString)
}

@SuppressWarnings("GrMethodMayBeStatic")
@NonCPS
def jsonParse(def jsonString) {
    new groovy.json.JsonSlurperClassic().parseText(jsonString)
}

def toJSONString(data) {
    return JsonOutput.toJson(data)
}
//functions check event source code
def checkoutSourceCode(checkoutType){
    if (checkoutType == "PUSH"){
        checkout changelog: true, poll: true, scm: [
            $class                           :  'GitSCM',
            branches                         : [[name: "${env.gitlabAfter}"]],
            doGenerateSubmoduleConfigurations: false,
            extensions                       : [[$class: 'UserIdentity',
                                                 email : 'duybvk@viettel.com.vn', name: 'duybvk'],
                                                [$class: 'CleanBeforeCheckout']],
            submoduleCfg                     : [],
            userRemoteConfigs                : [[credentialsId: "vdtc-gitlab",
                                                 url          : "${env.gitlabSourceRepoHomepage}" +".git"]]
        ]
    } else if (checkoutType == "MERGE") {
        checkout changelog: true, poll: true, scm: [
            $class                           : 'GitSCM',
            branches                         : [[name: "origin/${env.gitlabSourceBranch}"]],
            doGenerateSubmoduleConfigurations: false,
            extensions                       : [[$class : 'PreBuildMerge',
                                                 options: [
                                                     fastForwardMode: 'FF',
                                                     mergeRemote    : 'origin',
                                                     mergeStrategy  : 'RESOLVE',
                                                     mergeTarget    : "${env.gitlabTargetBranch}"
                                                 ]],
                                                [$class: 'UserIdentity',
                                                    email : 'duybvk@viettel.com.vn', name: 'duybvk'],
                                                [$class: 'CleanBeforeCheckout']],
            submoduleCfg                     : [],
            userRemoteConfigs                : [[credentialsId: "vdtc-gitlab",
                                                 url          : "${env.gitlabSourceRepoHomepage}" + ".git"]]
        ]
    }
}
// functions lấy thông tin member project
def getProjectMember(notifyMemberLevel){
    def project_members = []
    def project_member_notify = []
     withCredentials([usernamePassword(credentialsId: 'vdtc-gitlab', usernameVariable: 'user',
              passwordVariable: 'password')]){
        def currentPage = 1
        haveNextPage = true
        while (haveNextPage) {
            def response = httpRequest([
                acceptType   : 'APPLICATION_JSON',
                httpMode     : 'GET',
                contentType  : 'APPLICATION_JSON',
                customHeaders: [[name: 'Private-Token', value: password ]],
                url          : "${env.GITLAB_PROJECT_API_URL}/members/all?per_page=100&page=${currentPage}"
            ])

            def project_members_resp = jenkinsfile_utils.jsonParse(response.content)
            project_members.addAll(project_members_resp)
            if (project_members_resp.size() == 0) {
                haveNextPage = false
            } else {
                currentPage += 1
            }
        }
    }
    for (member in project_members) {
        if (member['access_level'].toInteger() >= notifyMemberLevel) {
            if (!project_member_notify.contains(member['username'])) {
                project_member_notify.add(member['username'])
            }
        }
    }
    return project_member_notify
}
def getServiceList(pomXMLStr, notServiceModuleList) {
    def serviceList = []
    def pomXml = parseXml(pomXMLStr)
    pomXml.modules[0].module.each {
        if (checkModuleIsService(it.text(), notServiceModuleList))
            serviceList.add(it.text())
    }
    return serviceList
}

def checkModuleIsService(String moduleName,notServiceModuleList) {
    isService = true
    for (notServiceModule in notServiceModuleList) {
        echo "${notServiceModule}"
        if (moduleName == notServiceModule) {
            isService = false
        }
    }
    echo "is service: ${isService}"
    return isService
}
return [
    parseXml                           : this.&parseXml,
    jsonParse                          : this.&jsonParse,
    toJSONString                       : this.&toJSONString,
    checkoutSourceCode                 : this.&checkoutSourceCode,
    getProjectMember                   : this.&getProjectMember
]
