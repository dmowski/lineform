import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { project, infoBlock } from '../../interfaces/project';
import { projectsService } from '../../services/projects.service';
import { fileService } from '../../services/file.service';

@Component({
	moduleId: module.id,
	selector: 'edit-project',
	templateUrl: './template.html',
	providers: [projectsService, fileService],
})

export class editProjectAppComponent {
	project: project;
	loadInfoList: Array<{}>;
	ngOnInit() {
		this.project = this.projectsService.getProjectById(this.route.snapshot.params.id, true);
		if(this.project && !this.project.title){
			this.project.title = '';
		}
	}
	tabSwitch(showBlock, hideBlock, hideBlock2, previewBlockComponent, needShowControls?) {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
		showBlock.style.display = 'block';
		hideBlock.style.display = 'none';
		hideBlock2.style.display = 'none';
		if (needShowControls) {
			previewBlockComponent.addControls();
		} else {
			previewBlockComponent.removeControls();
		}
	}

	addInfoBlock() {
		this.project.infoBlocks.push({
			'title' : 'test',
			'lines': [{"value": 'test'}, {"value": 'test'}, {"value": 'test'}],
		});
	}

	deleteBlock(index) {
		if (confirm('Delete block?')) {
			this.project.infoBlocks = this.project.infoBlocks.slice(0,index).concat(this.project.infoBlocks.slice(index + 1));
		}
	}

	deleteProject() {
		if (confirm('Delete project?')) {
			this.projectsService.deleteProject(this.project.id);
			this.router.navigate(['admin']);
		}
	}

	uploadMiniImg(fileSelect){
		var file = fileSelect.files[0];
		var result = this.fileService.uploadFile(file);
		result.then((result) => {
			if (result && result.miniUrlFile) {
				this.project.img = result.miniUrlFile;
				this.projectsService.updateProjects();
			}
		});
	}

	addImgToFirstImg(fileSelect) {
		var file = fileSelect.files[0];
		var result = this.fileService.uploadFile(file);
		result.then((result) => {
			if (result.urlFile) {
				this.project.firstImg = result.urlFile;
				this.projectsService.updateProjects();
			}
		});
	}
	addImgToGrid2(fileSelect){
		var file;
		var firstPart = '\r\n<div class="grid-part">';
		var firstPartHeight = 0;

		var secondpartPart = '\r\n<div class="grid-part">';
		var secondpartPartHeight = 0;
		let arrPromise = [];

		for (var i = fileSelect.files.length - 1; i >= 0; i--) {
			file = fileSelect.files[i];
			var result = this.fileService.uploadFile(file);
			arrPromise.push(result);
			result.then((result) => {
				var newHeight =  1000*result.height/result.width;

				if (firstPartHeight > secondpartPartHeight) {
					//во вторую
					secondpartPart += '\r\n    <img src="' + result.urlFile + '" class="grid" alt="">';
					secondpartPartHeight += newHeight;
				} else {
					//в первую
					firstPart += '\r\n    <img src="' + result.urlFile + '" class="grid" alt="">';
					firstPartHeight += newHeight;
				}
			});
		}

		Promise.all(arrPromise).then(() => {
			firstPart += '\r\n</div>\r\n';
			secondpartPart += '\r\n</div>\r\n';
			fileSelect.value = '';

			this.project.text += firstPart;
			this.project.text += secondpartPart;
			this.projectsService.updateProjects();
		})
	}

	addImgToText(fileSelect, className){
		this.loadInfoList = [];
		const listOfLoadingPromises = [];
		for (let i = 0; i < fileSelect.files.length; i++) {
			const file = fileSelect.files[i];

			const loadInfo = {
				name: file.name,
				status: 'loading',
				result: {}
			};

			this.loadInfoList.push(loadInfo);
			let waitPromise = this.fileService.uploadFile(file).then((result) => {
				if (result.urlFile) {
					loadInfo.status = 'done!';
				} else {
					console.log(result)
					loadInfo.status = 'error!';
				}
				loadInfo.result = result
				return loadInfo;
			});

			listOfLoadingPromises.push(waitPromise);
		}

		Promise.all(listOfLoadingPromises).then((loadInfoList) => {
			fileSelect.value = '';
			loadInfoList.forEach((loadInfo) => {
				let result = loadInfo.result;
				if (loadInfo.status.indexOf('done') > -1) {
					this.project.text += '\r\n<img src="' + result.urlFile + '" alt="" class="' + className + '">';
				}
			})
			this.projectsService.updateProjects();
		});
	}

	saveProject() {
		this.projectsService.saveProjects().then((result) => {
			debugger;
			console.log(result)
			alert('Проект сохранён');
		}).catch((error) => {
			debugger;
			console.log(error)
			alert('Ошибка. Проект не сохранён');
		});
	}

	constructor(private projectsService: projectsService, private route: ActivatedRoute, private router:Router, private fileService:fileService) {
		this.project = this.projectsService.getTemplateProject();
	}
}
