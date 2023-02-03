/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/

class Modal {
    constructor(id, title, content, footer, isHtml, customModal) {
        if (document.getElementById(id)) return document.getElementById(id);
        this.id = id

        this.modal = document.createElement('div')
        this.modal.setAttribute('role', 'dialog')
        this.modal.setAttribute('style', 'position: fixed; z-index: 1002; height: 277px; width: 439px; left: 738px; top: 365px; display: none;')
        this.modal.id = id
        this.modal.innerHTML = customModal ?? `
        <div role="dialog">
            <div class="modal-backdrop in"></div>
            <div role="dialog" tabindex="-1" class="in modal" style="display: block;">
                <div class="modal-window modal-dialog">
                    <div class="modal-content" role="document">
                        <div class="modal-header">
                        <button type="button" class="close"><span class="icon-close" id="${id}-cancel-btn"></span></button>
                        <h4 class="modal-title">${stripTags(title)}</h4>
                        </div>
                        <div class="modal-body">${isHtml ? content : stripTags(content)}</div>
                        <div class="modal-footer">
                        <div class="loading"></div>
                        <div class="modal-buttons"><button type="button" class="modal-button btn-control-md btn-min-width" id="${id}-confirm-btn">Ok</button></div>
                        <div class="text-footer">${stripTags(footer)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
        document.body.appendChild(this.modal)

        const confirm = document.getElementById(id+'-confirm-btn')
        const decline = document.getElementById(id+'-cancel-btn')
        confirm?.addEventListener?.('click', () => {
            if (!this.callback) return;
            this.modal.style.display = 'none'
            this.callback()
        })
        decline?.addEventListener?.('click', () => {
            this.modal.style.display = 'none'
        })

        this.title = title
        this.content = content
        this.footer = footer
    }

    /**
     * @param {string} text
     */
    set title(text) {
        this.modal.querySelector('.modal-title').innerHTML = text
    }
    
    /**
     * @param {string} text
     */
    set content(text) {
        this.modal.querySelector('.modal-body').innerHTML = text
    }

    /**
     * @param {string} text
     */
    set footer(text) {
        this.modal.querySelector('.text-footer').innerHTML = text
    }

    show(content, footer, hideOk) {
        this.modal.style.display = 'block'
        if (content) this.modal.querySelector('.modal-body').innerHTML = content || this.content;
        if (footer) this.modal.querySelector('.text-footer').innerHTML = footer || this.footer;
        if (this.modal?.querySelector('.modal-buttons')?.style?.display) this.modal.querySelector('.modal-buttons').style.display = hideOk && 'none' || 'block';
    }

    hide() {
        this.modal.style.display = 'none'
        this.modal.querySelector('.modal-body').innerHTML = this.content
        this.modal.querySelector('.text-footer').innerHTML = this.footer
        this.modal.querySelector('.modal-buttons').style.display = 'block'
        if (this.onhide) this.onhide();
    }

    addButton(text, id, callback, isButtonEl, overwrite) {
        const button = document.createElement(isButtonEl && 'button' || 'div')
        button.className = 'modal-button btn-control-md btn-min-width'
        button.id = id
        this.modal.querySelector('.modal-buttons').appendChild(button)
        if (overwrite) {
            button.outerHTML = text
        } else button.innerHTML = text;
        callback(button)
    }

    removeButton(id) {
        const button = document.getElementById(id)
        if (button) {
            button.remove()
        }
    }

    setCallback(callback) {
        this.callback = callback
    }

    get isOpen() {
        return this.modal.style.display === 'block'
    }
}