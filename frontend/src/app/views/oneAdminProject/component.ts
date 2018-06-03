import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { project } from '../../interfaces/project';
import { projectsService } from '../../services/projects.service';
import { fileService } from '../../services/file.service';

interface helpData {
    text: string;
    node: any;
    hide: boolean;
    hideImg: boolean;
}

@Component({
	moduleId: module.id,
	selector: 'one-admin-project',
	templateUrl: './template.html',
	providers: [projectsService, fileService],
})

export class oneAdminProjectViewAppComponent {
	project: project;
	contentElement: any;

	@Input() simple: boolean;
	@Input() projectData: project;
	public config: any;
	ngOnInit() {
		/*var doc = document.getElementById('startPageComponent');
		doc.style.height = window.innerHeight + 'px';*/
		if (this.simple && this.projectData) {
			this.project = this.projectData;
		} else {
			this.project = this.projectsService.getProjectById(this.route.snapshot.params.id);
		}

	}

	projectHelper: helpData;

	contentClick(event) {
		var target = arguments[0].target;
		if(target.tagName == 'P' || target.tagName[0] == 'H') {
			this.projectHelper.node = target;
			this.projectHelper.text = target.innerHTML;
			this.projectHelper.hide = false;
		}

		if(target.tagName == 'IMG') { 
			this.projectHelper.node = target;
			this.projectHelper.text = target.src;
			this.projectHelper.hideImg = false;
		}
	}

	getArrayFromContainer(query) {
		return Array.prototype.filter.call(this.contentElement.querySelectorAll(query), n => true);
	}

	addControls(content) {
		this.contentElement = content;
		this.removeControls(content);
		function createControlButton(className, text) {
			var control = document.createElement('span');
			control.classList.add('control');
			control.classList.add(className);
			control.textContent = text;
			return control;
		}

		var grids = this.getArrayFromContainer('.grid').forEach((grid)=>{
			grid.classList.add('grid-container-control');
		});

		let beforeInsterItems = [
			...this.getArrayFromContainer('p'),
			...this.getArrayFromContainer('h1'),
			...this.getArrayFromContainer('h2'),
			...this.getArrayFromContainer('img')
		];

		beforeInsterItems.forEach((textNode) => {
			if (textNode.closest('.grid-part')) {
				return;
			}

			textNode.before(createControlButton('add_full_img', 'Картинка'));
			textNode.before(createControlButton('add_p', 'Текст'));
		});

		this.getArrayFromContainer('.grid-part img').forEach((imgNode)=> {
			imgNode.before(createControlButton('add_img', 'Картинка'));
			imgNode.before(createControlButton('remove_img', 'Удалить эту'));
		})
	}

	removeControls(content) {
		this.contentElement = content;
		var grids = this.getArrayFromContainer('.grid').forEach((grid)=>{
			grid.classList.remove('grid-container-control');
		});

		this.getArrayFromContainer('.control').forEach((controlElement)=>{
			controlElement.remove();
		});
	}

	saveText(content) {
		this.project.text = content.innerHTML;
		this.projectHelper.hide = true;
		this.projectHelper.hideImg = true;
		this.project = this.projectsService.updateProject(this.project);
	}

	saveBlock(content, options) {
		if (this.projectHelper.node.tagName == 'P' || this.projectHelper.node.tagName[0] == 'H') {
			this.projectHelper.node.innerHTML = this.projectHelper.text;
			this.saveText(content);
		} else if (this.projectHelper.node.tagName == 'IMG') {
			var fileSelect = options;
			var file = fileSelect.files[0];
			var result = this.fileService.uploadFile(file);
			result.then((result) => {
				if (this.projectHelper.node.classList.contains('half') && result.urlFile) {
					this.projectHelper.node.src = result.urlFile;
				}else if (result.urlFile) {
					this.projectHelper.node.src = result.urlFile;
				}
				this.saveText(content);
			});
		}
	}

	deleteBlock(content) {
		this.projectHelper.node.parentElement.removeChild(this.projectHelper.node);
		this.saveText(content);
	}

	addNewTextTag(content, tag) {
		this.project.text = content.innerHTML + "\r\n \r\n<"+tag+">Texxt</"+tag+">";
	}

	addNewTagImg(content, option) {
		this.project.text += '\r\n \r\n<img src="' + null + '" alt="" class="' + option + '">';
	}


	addBeforeText(content, tag) {
		var newNode = document.createElement(tag);
		newNode.textContent = 'New Text';
		this.projectHelper.node.parentElement.insertBefore(newNode, this.projectHelper.node)
		this.saveText(content);
	}

	addNewTagImgBefore(content, option) {
		var newNode = document.createElement('img');
		newNode.classList.add(option);
		newNode.src = 'null';
		this.projectHelper.node.parentElement.insertBefore(newNode, this.projectHelper.node)
		this.saveText(content);
	}

	constructor(private projectsService: projectsService, private route: ActivatedRoute, private router:Router, private fileService:fileService) {
		this.config = {
			loaded: false
		};

		this.projectHelper = <helpData>{};
		this.projectHelper.hide = true;
		this.projectHelper.hideImg = true;
		this.projectHelper.text = 'asd';
	}
}
