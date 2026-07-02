package com.collegesports.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SPAController {

    // Forward front-end routes directly to index.html so Angular's router can handle them
    @RequestMapping(value = { "/login", "/admin", "/student", "/coach" })
    public String forwardToFrontend() {
        return "forward:/index.html";
    }
}
