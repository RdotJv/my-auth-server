package com.accel.controller;

import com.accel.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

@Controller
@AllArgsConstructor
public class AuthVIewController {
    private final UserService userService;

    @GetMapping("/login")
    public String showLogin() {return "login";}
    @GetMapping("/register")
    public String showRegister() {return "register";}

    @PostMapping("/register")
    public RedirectView register(
            @RequestParam String username,
            @RequestParam String password,
            Model model
    ) {
        try {
            userService.register(username, password);
//            return "redirect:/login?success";
            return new RedirectView("http://localhost:5173/");
        } catch (IllegalArgumentException e) {
            model.addAttribute("error", e.getMessage());
            return new RedirectView("register");
        }
    }
}
